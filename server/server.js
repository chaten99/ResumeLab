import http from "http";
import { env } from "./src/config/env.js";
import logger from "./src/config/logger.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import { initSocket } from "./src/config/socket.js";
import app from "./src/app.js";

const startServer = async () => {
    await connectDB();
    await connectRedis();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.PORT, () => {
        logger.info({
            port: env.PORT,
            environment: env.NODE_ENV,
        }, "ResumeLab Server started with Socket.io");
    });
};

startServer();