import { Worker } from "bullmq";
import { uploadFileToS3 } from "../services/s3.service.js";
import { emitToUser } from "../config/socket.js";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import Redis from "ioredis";

const getRedisUrl = (urlStr) => {
  if (!urlStr) return "redis://127.0.0.1:6379";
  return urlStr.replace("localhost", "127.0.0.1");
};

const redisUrl = getRedisUrl(env.REDIS_URL);

const workerConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const mediaWorker = new Worker(
  "media-upload",
  async (job) => {
    logger.info({ jobId: job.id }, "Media worker processing job");
    return { success: true };
  },
  {
    connection: workerConnection,
    concurrency: 5,
  }
);

mediaWorker.on("ready", () => {
  logger.info("Media upload worker ready");
});

export default mediaWorker;
