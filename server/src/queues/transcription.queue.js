import { Queue } from "bullmq";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import Redis from "ioredis";

let transcriptionQueue;
let queueConnection;

const getRedisUrl = (urlStr) => {
  if (!urlStr) return "redis://127.0.0.1:6379";
  return urlStr.replace("localhost", "127.0.0.1");
};

const redisUrl = getRedisUrl(env.REDIS_URL);

try {
  queueConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  queueConnection.on("error", (err) => {
    logger.error({ err: err.message }, "BullMQ resume-transcription queue Redis error");
  });

  transcriptionQueue = new Queue("resume-transcription", {
    connection: queueConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  transcriptionQueue.getFailed().then((failedJobs) => {
    if (failedJobs.length > 0) {
      failedJobs.forEach((j) => j.remove().catch(() => {}));
    }
  }).catch(() => {});

  logger.info("BullMQ resume-transcription queue initialized");
} catch (err) {
  logger.error({ err: err.message }, "Failed to initialize BullMQ resume-transcription queue");
}

export const getTranscriptionQueue = () => transcriptionQueue;

export const addResumeTranscriptionJob = async (jobData) => {
  if (!transcriptionQueue) {
    logger.warn("BullMQ transcriptionQueue unavailable.");
    return null;
  }

  const uniqueJobId = `transcription_${jobData.resumeId}_${Date.now()}`;

  const job = await transcriptionQueue.add("process-resume-transcription", jobData, {
    jobId: uniqueJobId,
  });

  logger.info({ jobId: job.id, resumeId: jobData.resumeId }, "Resume transcription job added to queue");
  return job;
};
