import { Queue } from "bullmq";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import Redis from "ioredis";

let resumeQueue;
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
    logger.error({ err: err.message }, "BullMQ resume-upload queue Redis error");
  });

  resumeQueue = new Queue("resume-upload", {
    connection: queueConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  resumeQueue.getFailed().then((failedJobs) => {
    if (failedJobs.length > 0) {
      logger.info({ count: failedJobs.length }, "Removing old failed resume jobs from Redis");
      failedJobs.forEach((j) => j.remove().catch(() => {}));
    }
  }).catch(() => {});

  logger.info("BullMQ resume-upload queue initialized");
} catch (err) {
  logger.error({ err: err.message }, "Failed to initialize BullMQ resume-upload queue");
}

export const getResumeQueue = () => resumeQueue;

export const addResumeUploadJob = async (jobData) => {
  if (!resumeQueue) {
    logger.warn("BullMQ resumeQueue unavailable.");
    return null;
  }

  const uniqueJobId = `resume_${jobData.resumeId}_${Date.now()}`;

  const job = await resumeQueue.add("process-resume-intro", jobData, {
    jobId: uniqueJobId,
  });

  logger.info({ jobId: job.id, resumeId: jobData.resumeId }, "Resume intro job added to queue");
  return job;
};

export { queueConnection, redisUrl };
