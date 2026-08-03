import { Queue } from "bullmq";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import Redis from "ioredis";

let mediaQueue;
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

  mediaQueue = new Queue("media-upload", {
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

  logger.info("BullMQ media-upload queue initialized");
} catch (err) {
  logger.error({ err: err.message }, "Failed to initialize media-upload queue");
}

export const addMediaUploadJob = async (jobData) => {
  if (!mediaQueue) return null;
  const uniqueJobId = `media_${jobData.mediaId}_${Date.now()}`;
  return await mediaQueue.add("process-media-upload", jobData, { jobId: uniqueJobId });
};

export { queueConnection };
