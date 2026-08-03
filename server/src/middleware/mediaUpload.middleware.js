import multer from "multer";
import path from "path";
import fs from "fs";
import AppError from "../utils/AppError.js";

const tempDir = path.join(process.cwd(), "uploads", "temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `resume-media-${uniqueSuffix}${ext}`);
    },
});

const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a"];
const ALLOWED_MIMES = [
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mp4",
    "video/x-matroska",
    "audio/webm",
];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIMES.includes(file.mimetype)) {
        return cb(
            new AppError(
                `Unsupported media file format '${ext}'. Allowed formats: mp4, mov, webm, mp3, wav, m4a`,
                400
            )
        );
    }
    cb(null, true);
};

export const mediaUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024,
    },
});
