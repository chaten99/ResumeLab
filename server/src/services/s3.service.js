import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

const hasAws = Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);

let s3Client = null;
if (hasAws) {
    s3Client = new S3Client({
        region: env.AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
    });
}

const LOCAL_S3_DIR = path.join(process.cwd(), "uploads", "s3");
if (!hasAws && !fs.existsSync(LOCAL_S3_DIR)) {
    fs.mkdirSync(LOCAL_S3_DIR, { recursive: true });
}

export const uploadFileToS3 = async (filePath, objectKey, contentType = "video/mp4", onProgress) => {
    if (!fs.existsSync(filePath)) {
        throw new Error("Temporary upload file missing from disk");
    }

    const stat = fs.statSync(filePath);
    const fileSizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    const bucketName = env.AWS_S3_BUCKET_NAME || "resumelab-storage";

    console.log(`[Storage] Uploading ${path.basename(filePath)} (${fileSizeMB} MB)...`);

    if (typeof onProgress === "function") {
        onProgress(35);
    }

    if (!hasAws) {
        const sanitizedKey = objectKey.replace(/[\/\\]/g, "_");
        const destPath = path.join(LOCAL_S3_DIR, sanitizedKey);

        fs.copyFileSync(filePath, destPath);
        try {
            fs.unlinkSync(filePath);
        } catch (_) {}

        if (typeof onProgress === "function") {
            onProgress(85);
        }

        const serverPort = env.PORT || 5000;
        const localUrl = `http://localhost:${serverPort}/uploads/s3/${sanitizedKey}`;

        console.log(`[Storage] Upload completed`);

        return {
            bucket: "local-dev-bucket",
            region: "local",
            objectKey: sanitizedKey,
            url: localUrl,
            etag: `mock-etag-${Date.now()}`,
            bytes: stat.size,
        };
    }

    const fileStream = fs.createReadStream(filePath);
    const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: fileStream,
        ContentType: contentType,
    });

    try {
        const response = await s3Client.send(putCommand);

        if (typeof onProgress === "function") {
            onProgress(75);
        }

        const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        const presignedUrl = await getSignedUrl(s3Client, getCommand, {
            expiresIn: env.AWS_PRESIGNED_URL_EXPIRES_IN || 3600,
        });

        if (typeof onProgress === "function") {
            onProgress(95);
        }

        console.log(`[Storage] Upload completed`);

        return {
            bucket: bucketName,
            region: env.AWS_REGION || "us-east-1",
            objectKey,
            url: presignedUrl,
            etag: response.ETag ? response.ETag.replace(/"/g, "") : `etag-${Date.now()}`,
            bytes: stat.size,
        };
    } finally {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (_) {}
        }
    }
};

export const getPresignedDownloadUrl = async (objectKey, expiresIn = 3600) => {
    if (!hasAws || objectKey.startsWith("uploads_")) {
        const serverPort = env.PORT || 5000;
        return `http://localhost:${serverPort}/uploads/s3/${objectKey}`;
    }

    const bucketName = env.AWS_S3_BUCKET_NAME || "resumelab-storage";
    const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    return await getSignedUrl(s3Client, getCommand, { expiresIn });
};

export const deleteFileFromS3 = async (objectKey) => {
    if (!objectKey) return true;

    if (!hasAws || objectKey.startsWith("uploads_")) {
        const localPath = path.join(LOCAL_S3_DIR, objectKey);
        if (fs.existsSync(localPath)) {
            try {
                fs.unlinkSync(localPath);
            } catch (_) {}
        }
        return true;
    }

    const bucketName = env.AWS_S3_BUCKET_NAME || "resumelab-storage";
    try {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });
        await s3Client.send(deleteCommand);
        return true;
    } catch (_) {
        return false;
    }
};
