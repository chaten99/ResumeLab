import Resume from "../models/resume.model.js";
import AppError from "../utils/AppError.js";
import { deleteFileFromS3 } from "../services/s3.service.js";

export const getUserMedia = async (req, res) => {
  const userId = req.user._id;
  const resumes = await Resume.find({
    userId,
    "media.url": { $ne: null },
  })
    .sort({ createdAt: -1 })
    .lean();

  const media = resumes.map((r) => ({
    _id: r._id,
    resumeId: r._id,
    title: r.originalName,
    originalFileName: r.media?.originalName || r.originalName,
    resourceType: r.media?.type || "video",
    size: r.media?.size || 0,
    duration: r.media?.duration || 0,
    url: r.media?.url,
    uploadStatus: r.uploadStatus || "COMPLETED",
    createdAt: r.createdAt,
  }));

  return res.status(200).json({
    success: true,
    media,
  });
};

export const deleteMedia = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const resume = await Resume.findOne({ _id: id, userId });
  if (!resume) {
    throw new AppError("Media record not found", 404);
  }

  if (resume.media?.objectKey) {
    await deleteFileFromS3(resume.media.objectKey);
  }

  resume.media = undefined;
  resume.uploadStatus = "FAILED";
  await resume.save();

  return res.status(200).json({
    success: true,
    message: "Media deleted successfully",
  });
};
