import { Worker } from "bullmq";
import Resume from "../models/resume.model.js";
import User from "../models/user.model.js";
import { transcribeMedia } from "../services/ai/transcription.service.js";
import { extractStructuredDataFromTranscript } from "../services/ai/transcriptExtractor.service.js";
import { downloadFileFromS3OrLocal } from "../services/s3.service.js";
import { sendResumeIntroEmail } from "../services/resumeEmail.service.js";
import { createInAppNotification } from "../services/notification.service.js";
import { recordActivity } from "../services/activity.service.js";
import { emitToUser } from "../config/socket.js";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import fs from "fs";
import Redis from "ioredis";

let transcriptionWorker;

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
  logger.error({ err: err.message }, "Transcription worker Redis connection error");
});

transcriptionWorker = new Worker(
  "resume-transcription",
  async (job) => {
    const { resumeId, userId, objectKey, filePath, mimeType, resourceType, originalFileName } = job.data;

    console.log(`[Transcription Worker] Starting speech-to-text for resumeId: "${resumeId}"...`);

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return { skipped: true, reason: "resume_missing" };
    }

    const user = await User.findById(userId);

    await Resume.updateOne(
      { _id: resumeId },
      {
        $set: {
          "transcript.status": "PROCESSING",
          "transcript.jobId": job.id,
          "transcript.failureReason": null,
        },
      }
    );

    emitToUser(userId, "resume:transcription-started", {
      resumeId,
      status: "PROCESSING",
      progress: 25,
      step: "Extracting Speech",
    });

    const targetObjectKey = objectKey || resume.media?.objectKey;
    const targetMediaUrl = resume.media?.url;
    let fileResult = null;

    if (filePath && fs.existsSync(filePath)) {
      fileResult = { filePath, isTemp: false };
    } else {
      fileResult = await downloadFileFromS3OrLocal(targetObjectKey, targetMediaUrl);
    }

    if (!fileResult || !fileResult.filePath || !fs.existsSync(fileResult.filePath)) {
      const errMsg = "Media file unavailable for speech extraction.";
      await Resume.updateOne(
        { _id: resumeId },
        {
          $set: {
            "transcript.status": "FAILED",
            "transcript.failureReason": errMsg,
          },
        }
      );

      emitToUser(userId, "resume:transcription-failed", {
        resumeId,
        status: "FAILED",
        failureReason: errMsg,
      });

      return { skipped: true, reason: "file_missing" };
    }

    const targetFilePath = fileResult.filePath;

    emitToUser(userId, "resume:transcription-progress", {
      resumeId,
      status: "PROCESSING",
      progress: 60,
      step: "Generating Speech Transcript",
    });

    try {
      const result = await transcribeMedia({
        filePath: targetFilePath,
        mimeType: mimeType || resume.media?.mimeType,
        resourceType: resourceType || resume.media?.type,
      });

      emitToUser(userId, "resume:transcription-progress", {
        resumeId,
        status: "PROCESSING",
        progress: 80,
        step: "Extracting Resume Information",
      });

      let structuredData = null;
      try {
        structuredData = await extractStructuredDataFromTranscript(
          result.text || "",
          resume.targetRole || "Full Stack Engineer"
        );
      } catch (extractErr) {
        logger.warn({ err: extractErr.message }, "AI extraction warning; continuing with empty structure");
        structuredData = {
          contact: { fullName: null, email: null, phone: null },
          summary: "",
          skills: { technicalSkills: [], softSkills: [], tools: [], languages: [] },
          experience: [],
          projects: [],
          education: [],
        };
      }

      const updatedResume = await Resume.findByIdAndUpdate(
        resumeId,
        {
          $set: {
            transcript: {
              status: "COMPLETED",
              text: result.text || "",
              language: result.language || "en",
              duration: result.duration || 0,
              provider: "gemini",
              jobId: job.id,
              failureReason: null,
              completedAt: new Date(),
            },
            structuredResume: structuredData,
            summary: structuredData?.summary || "",
            projects: structuredData?.projects || [],
            skills: structuredData?.skills?.technicalSkills || [],
            education: structuredData?.education || [],
            experience: structuredData?.experience || [],
            status: "completed",
            currentStep: 2,
          },
        },
        { new: true }
      );

      console.log(`[Transcription Worker] Speech transcription & AI resume extraction completed successfully`);

      emitToUser(userId, "resume:transcription-completed", {
        resumeId,
        status: "COMPLETED",
        progress: 100,
        transcript: updatedResume?.transcript,
        structuredResume: updatedResume?.structuredResume,
        resume: updatedResume ? updatedResume.toObject() : null,
      });

      emitToUser(userId, "resume:extraction-completed", {
        resumeId,
        structuredResume: updatedResume?.structuredResume,
      });

      if (user?.email) {
        try {
          await sendResumeIntroEmail({
            email: user.email,
            name: user.name,
            fileName: originalFileName || resume.originalName,
            status: "COMPLETED",
            uploadedAt: new Date(),
          });
        } catch (_) {}
      }

      try {
        await createInAppNotification({
          userId,
          title: "Resume Data Ready",
          message: `Extracted professional resume details for "${originalFileName || resume.originalName}". Review in Step 2.`,
          type: "success",
        });
      } catch (_) {}

      try {
        await recordActivity({
          userId,
          type: "resume_transcription_completed",
          description: `Extracted structured resume details for "${originalFileName || resume.originalName}"`,
          metadata: { resumeId, transcriptLength: result.text?.length || 0 },
        });
      } catch (_) {}

      return { success: true, resumeId, textLength: result.text?.length || 0 };
    } catch (err) {
      console.error(`[Transcription Worker] Error during speech extraction: ${err.message}`);

      await Resume.updateOne(
        { _id: resumeId },
        {
          $set: {
            "transcript.status": "FAILED",
            "transcript.failureReason": err.message || "Failed speech transcription",
          },
        }
      );

      emitToUser(userId, "resume:transcription-failed", {
        resumeId,
        status: "FAILED",
        failureReason: err.message || "Failed speech transcription",
      });

      if (user?.email) {
        try {
          await sendResumeIntroEmail({
            email: user.email,
            name: user.name,
            fileName: originalFileName || resume.originalName,
            status: "FAILED",
            failureReason: err.message,
            uploadedAt: new Date(),
          });
        } catch (_) {}
      }

      try {
        await createInAppNotification({
          userId,
          title: "Speech Extraction Failed",
          message: `Failed to extract transcript from "${originalFileName || resume.originalName}": ${err.message}`,
          type: "error",
        });
      } catch (_) {}

      throw err;
    } finally {
      if (fileResult && fileResult.isTemp && fs.existsSync(fileResult.filePath)) {
        try {
          fs.unlinkSync(fileResult.filePath);
        } catch (_) {}
      }
    }
  },
  {
    connection: workerConnection,
    concurrency: 3,
    lockDuration: 120000,
    stalledInterval: 60000,
  }
);

export default transcriptionWorker;
