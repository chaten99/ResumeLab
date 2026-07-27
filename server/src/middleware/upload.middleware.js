import multer from "multer";
import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 5*1024*1024; // 5MB

const storage  = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if(file.mimetype !== "application/pdf") {
        return cb(new AppError("Only PDF files are allowed", 400), false);
    }
    cb(null, true);
}

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter,
});

export default upload;