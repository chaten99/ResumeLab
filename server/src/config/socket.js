import { Server } from "socket.io";
import { env } from "./env.js";
import logger from "./logger.js";
import { verifyAccessToken } from "../utils/token.js";
import User from "../models/user.model.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.match(/accessToken=([^;]+)/)?.[1];
      if (token) {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select("role isDisabled");
        if (user && !user.isDisabled) {
          socket.user = { id: user._id.toString(), role: user.role };
        }
      }
    } catch {
      
    }
    next();
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id, user: socket.user?.id }, "Socket client connected");

    if (socket.user?.id) {
      const userRoom = `user:${socket.user.id}`;
      socket.join(userRoom);
      logger.info({ socketId: socket.id, userRoom }, "Socket automatically joined user room");

      if (socket.user.role === "admin") {
        socket.join("admin");
        logger.info({ socketId: socket.id }, "Socket joined admin room");
      }
    }

    socket.on("join", (userId) => {
      if (userId) {
        const roomName = `user:${userId}`;
        socket.join(roomName);
        logger.info({ socketId: socket.id, roomName }, "Socket explicitly joined user room");
      }
    });

    socket.on("joinAdmin", () => {
      socket.join("admin");
      logger.info({ socketId: socket.id }, "Socket explicitly joined admin room");
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket client disconnected");
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  const room = `user:${userId.toString()}`;
  logger.info({ room, event }, "[Socket] emitToUser");
  io.to(room).emit(event, data);
};

export const emitToAdmin = (event, data) => {
  if (!io) return;
  io.to("admin").emit(event, data);
};

export const broadcastEvent = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};
