import puppeteer from "puppeteer";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import { renderResumeHtml } from "../templates/htmlTemplateRenderer.js";
import { uploadBufferToS3 } from "../s3.service.js";

export const generateServerPdf = async (resume) => {
  if (!resume) {
    throw new AppError("Resume object is required for PDF generation", 400);
  }

  const structuredData = resume.structuredResume || {};
  const templateId = resume.selectedTemplate || "modern";
  const colorTheme = resume.selectedColor || "indigo";
  const targetRole = resume.targetRole || "Full Stack Engineer";
  const version = resume.version || 1;

  logger.info(
    { resumeId: resume._id, templateId, colorTheme, version },
    "[PDF Generator] Starting server-side Puppeteer PDF generation..."
  );

  let browser = null;
  try {
    const htmlContent = renderResumeHtml(structuredData, templateId, colorTheme, targetRole);

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    const rawName = structuredData?.contact?.fullName || "Candidate";
    const sanitizedName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const objectKey = `resumes/pdf/${resume.userId}_${resume._id}_v${version}_${sanitizedName}.pdf`;

    const uploadResult = await uploadBufferToS3(pdfBuffer, objectKey, "application/pdf");

    logger.info({ resumeId: resume._id, url: uploadResult.url }, "[PDF Generator] PDF generated and stored in S3");

    return {
      status: "COMPLETED",
      key: uploadResult.objectKey,
      url: uploadResult.url,
      generatedAt: new Date(),
      version,
    };
  } catch (err) {
    logger.error({ resumeId: resume._id, err: err.message }, "[PDF Generator] Failed to generate PDF");
    throw new AppError(`Server PDF generation failed: ${err.message}`, 500);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
  }
};
