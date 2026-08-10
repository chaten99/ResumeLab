import { Worker } from "bullmq";
import Resume from "../models/resume.model.js";
import User from "../models/user.model.js";
import { uploadFileToS3 } from "../services/s3.service.js";
import { sendResumeIntroEmail } from "../services/resumeEmail.service.js";
import { createInAppNotification } from "../services/notification.service.js";
import { recordActivity } from "../services/activity.service.js";
import { emitToUser } from "../config/socket.js";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import fs from "fs";
import Redis from "ioredis";
import { addResumeTranscriptionJob } from "../queues/transcription.queue.js";

let resumeWorker;

const getRedisUrl = (urlStr) => {
  if (!urlStr) return "redis://127.0.0.1:6379";
  return urlStr.replace("localhost", "127.0.0.1");
};

const redisUrl = getRedisUrl(env.REDIS_URL);

const workerConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

workerConnection.on("error", (err) => {
  logger.error({ err: err.message }, "Resume worker connection error");
});

resumeWorker = new Worker(
  "resume-upload",
  async (job) => {
    const { resumeId, userId, filePath, originalFileName, resourceType, mimeType, size } = job.data;

    console.log(`[Resume Worker] Processing file "${originalFileName}"...`);

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return { skipped: true, reason: "resume_missing" };
    }

    if (!fs.existsSync(filePath)) {
      await Resume.updateOne(
        { _id: resumeId },
        {
          $set: {
            uploadStatus: "FAILED",
            processingStatus: "FAILED",
            failureReason: "Uploaded file was lost before processing. Please re-upload.",
          },
        }
      );
      emitToUser(userId, "resume:failed", {
        resumeId,
        status: "FAILED",
        failureReason: "Uploaded file was lost before processing. Please re-upload.",
      });
      return { skipped: true, reason: "file_missing" };
    }

    const user = await User.findById(userId);

    await Resume.updateOne(
      { _id: resumeId },
      {
        $set: {
          uploadStatus: "UPLOADING",
          processingStatus: "UPLOADING",
          jobId: job.id,
        },
      }
    );

    emitToUser(userId, "resume:uploading", {
      resumeId,
      status: "UPLOADING",
      progress: 15,
    });

    try {
      const objectKey = `ResumeLab/resumes/${userId}/media/${Date.now()}_${originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const s3Result = await uploadFileToS3(filePath, objectKey, mimeType, (p) => {
        emitToUser(userId, "resume:progress", {
          resumeId,
          status: "UPLOADING",
          progress: p,
        });
      });

      emitToUser(userId, "resume:progress", {
        resumeId,
        status: "UPLOADING",
        progress: 90,
      });

      const mediaData = {
        type: resourceType,
        originalName: originalFileName,
        mimeType: mimeType || "",
        size: s3Result.bytes || size || 0,
        duration: 0,
        bucket: s3Result.bucket,
        objectKey: s3Result.objectKey,
        url: s3Result.url,
        etag: s3Result.etag,
        status: "COMPLETED",
        uploadedAt: new Date(),
      };

      const updatedResume = await Resume.findByIdAndUpdate(
        resumeId,
        {
          $set: {
            media: mediaData,
            uploadStatus: "COMPLETED",
            processingStatus: "COMPLETED",
            "transcript.status": "PENDING",
            currentStep: 1.5,
          },
        },
        { new: true }
      );

      console.log(`[Resume Worker] Upload finished successfully`);

      emitToUser(userId, "resume:completed", {
        resumeId,
        status: "COMPLETED",
        progress: 100,
        media: mediaData,
        resume: updatedResume ? updatedResume.toObject() : null,
      });

      try {
        await addResumeTranscriptionJob({
          resumeId: resumeId.toString(),
          userId: userId.toString(),
          filePath,
          objectKey: s3Result.objectKey,
          mimeType,
          resourceType,
          originalFileName,
        });
        console.log(`[Resume Worker] Enqueued transcription job for resumeId: ${resumeId}`);
      } catch (transcribeErr) {
        logger.error({ err: transcribeErr.message }, "Failed to enqueue transcription job");
      }

      if (user?.email) {
        try {
          await sendResumeIntroEmail({
            email: user.email,
            name: user.name,
            fileName: originalFileName,
            status: "COMPLETED",
            uploadedAt: new Date(),
          });
        } catch (_) {}
      }

      try {
        await createInAppNotification({
          userId,
          title: "Introduction Uploaded",
          message: `Your self-introduction ${resourceType} "${originalFileName}" was uploaded successfully. Speech extraction started.`,
          type: "success",
        });
      } catch (_) {}

      try {
        await recordActivity({
          userId,
          type: "resume_intro_uploaded",
          description: `Uploaded self-introduction ${resourceType} "${originalFileName}"`,
          metadata: { resumeId, objectKey: s3Result.objectKey, url: s3Result.url },
        });
      } catch (_) {}

      return { success: true, resumeId };
    } catch (err) {
      await Resume.updateOne(
        { _id: resumeId },
        {
          $set: {
            uploadStatus: "FAILED",
            processingStatus: "FAILED",
            failureReason: err.message || "Failed to process introduction upload",
          },
        }
      );

      emitToUser(userId, "resume:failed", {
        resumeId,
        status: "FAILED",
        failureReason: err.message || "Failed to process introduction upload",
      });

      if (user?.email) {
        try {
          await sendResumeIntroEmail({
            email: user.email,
            name: user.name,
            fileName: originalFileName,
            status: "FAILED",
            failureReason: err.message,
            uploadedAt: new Date(),
          });
        } catch (_) {}
      }

      try {
        await createInAppNotification({
          userId,
          title: "Upload Failed",
          message: `Failed to upload "${originalFileName}": ${err.message}`,
          type: "error",
        });
      } catch (_) {}

      throw err;
    }
  },
  {
    connection: workerConnection,
    concurrency: 5,
    lockDuration: 120000,
    stalledInterval: 60000,
  }
);

export default resumeWorker;
