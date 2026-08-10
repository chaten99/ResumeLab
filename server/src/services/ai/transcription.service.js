import gemini from "../../config/gemini.js";
import { env } from "../../config/env.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import fs from "fs";
import path from "path";

const getMimeTypeFromExt = (filePath, fallbackMime = "audio/mp3") => {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".mp3": "audio/mp3",
    ".wav": "audio/wav",
    ".m4a": "audio/m4a",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
  };
  return map[ext] || fallbackMime;
};

export const transcribeMedia = async ({ filePath, mimeType, resourceType }) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new AppError("Media file not found for transcription", 404);
  }

  const fileStats = fs.statSync(filePath);
  if (fileStats.size === 0) {
    return {
      text: "",
      language: "en",
      duration: 0,
      isEmpty: true,
    };
  }

  const determinedMime = mimeType || getMimeTypeFromExt(filePath, resourceType === "video" ? "video/mp4" : "audio/mp3");

  let base64Data;
  try {
    const fileBuffer = fs.readFileSync(filePath);
    base64Data = fileBuffer.toString("base64");
  } catch (err) {
    logger.error({ err: err.message, filePath }, "Failed to read media file buffer for transcription");
    throw new AppError(`Failed to read media file for transcription: ${err.message}`, 500);
  }

  const prompt = `You are a high-precision, exact Speech-To-Text transcription engine.
Listen carefully to the audio/video provided in the media file.

CRITICAL TRANSCRIPTION RULES:
- Perform EXACT VERBATIM SPEECH-TO-TEXT TRANSCRIPTION ONLY.
- Output ONLY the raw spoken words in the exact sequence they were spoken.
- DO NOT summarize, optimize, paraphrase, fix grammar, or rewrite what was said.
- DO NOT add titles, headers, bullet points, introduction, or conclusion.
- DO NOT add metadata like "Speaker 1:", "Transcript:", or timestamp markers.
- If there is no speech, background music only, or completely silent audio, return an empty string "".
- Return ONLY plain text format.`;

  try {
    const response = await gemini.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [
        {
          inlineData: {
            mimeType: determinedMime,
            data: base64Data,
          },
        },
        prompt,
      ],
      config: {
        temperature: 0.0,
      },
    });

    const transcriptText = (response?.text || "").trim();

    logger.info(
      { length: transcriptText.length, filePath },
      "[Transcription Service] Speech-to-text extraction completed successfully"
    );

    return {
      text: transcriptText,
      language: "en",
      duration: 0,
      isEmpty: !transcriptText,
    };
  } catch (err) {
    logger.error({ err: err.message, filePath }, "[Transcription Service] Gemini speech-to-text error");
    throw new AppError(`Transcription engine failure: ${err.message}`, 500);
  }
};
