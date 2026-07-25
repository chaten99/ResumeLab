import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import httpLogger from "./middleware/httpLogger.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// middlewares
app.use(httpLogger);
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ResumeLab API is running",
    });
});


// not found middleware
app.use(notFound);
// error handler middleware
app.use(errorHandler);

export default app;