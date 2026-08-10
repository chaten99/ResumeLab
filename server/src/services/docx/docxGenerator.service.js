import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import { uploadBufferToS3 } from "../s3.service.js";

export const generateServerDocx = async (resume) => {
  if (!resume) {
    throw new AppError("Resume object is required for DOCX generation", 400);
  }

  const data = resume.structuredResume || {};
  const contact = data?.contact || {};
  const summary = data?.summary || "";
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];
  const targetRole = resume.targetRole || "Full Stack Engineer";
  const version = resume.version || 1;

  logger.info(
    { resumeId: resume._id, version },
    "[DOCX Generator] Starting server-side DOCX document generation..."
  );

  try {
    const children = [];

    // Candidate Name
    children.push(
      new Paragraph({
        text: (contact.fullName || "Candidate Name").toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    // Target Role
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: (targetRole || "Full Stack Engineer").toUpperCase(),
            bold: true,
            color: "4F46E5",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
      })
    );

    // Contact Parts
    const contactParts = [
      contact.email,
      contact.phone,
      contact.location,
      contact.linkedin,
      contact.github,
    ].filter(Boolean);

    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join("  |  "),
              size: 18,
              color: "64748B",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    // Professional Summary
    if (summary) {
      children.push(
        new Paragraph({
          text: "PROFESSIONAL SUMMARY",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: summary, size: 20 })],
          spacing: { after: 250 },
        })
      );
    }

    // Work Experience
    if (experience.length > 0) {
      children.push(
        new Paragraph({
          text: "WORK EXPERIENCE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      for (const exp of experience) {
        const dates = `${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}`;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${exp.title}`, bold: true, size: 20 }),
              new TextRun({ text: `  at  ${exp.company}`, italics: true, size: 20 }),
              new TextRun({ text: ` (${dates})`, size: 18, color: "64748B" }),
            ],
            spacing: { before: 100, after: 50 },
          })
        );

        if (exp.bullets) {
          for (const bullet of exp.bullets) {
            children.push(
              new Paragraph({
                text: `• ${bullet}`,
                spacing: { before: 30, after: 30 },
              })
            );
          }
        }
      }
    }

    // Key Projects
    if (projects.length > 0) {
      children.push(
        new Paragraph({
          text: "KEY PROJECTS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 250, after: 100 },
        })
      );

      for (const proj of projects) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.title, bold: true, size: 20 }),
              proj.techStack?.length
                ? new TextRun({ text: `  [${proj.techStack.join(", ")}]`, color: "4F46E5", size: 18 })
                : new TextRun({ text: "" }),
            ],
            spacing: { before: 80, after: 40 },
          })
        );

        if (proj.description) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: proj.description, size: 19 })],
              spacing: { after: 40 },
            })
          );
        }

        if (proj.bullets) {
          for (const bullet of proj.bullets) {
            children.push(
              new Paragraph({
                text: `• ${bullet}`,
                spacing: { before: 30, after: 30 },
              })
            );
          }
        }
      }
    }

    // Skills & Tools
    if (skills.technicalSkills?.length || skills.tools?.length) {
      children.push(
        new Paragraph({
          text: "TECHNICAL SKILLS & TOOLS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 250, after: 100 },
        })
      );

      if (skills.technicalSkills?.length) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Technical: ", bold: true, size: 20 }),
              new TextRun({ text: skills.technicalSkills.join(", "), size: 20 }),
            ],
            spacing: { after: 60 },
          })
        );
      }

      if (skills.tools?.length) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Tools & Platforms: ", bold: true, size: 20 }),
              new TextRun({ text: skills.tools.join(", "), size: 20 }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }

    // Education
    if (education.length > 0) {
      children.push(
        new Paragraph({
          text: "EDUCATION",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 250, after: 100 },
        })
      );

      for (const edu of education) {
        const eduDates = `${edu.startDate || ""} - ${edu.endDate || ""}`;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true, size: 20 }),
              new TextRun({ text: `, ${edu.institution}`, size: 20 }),
              new TextRun({ text: ` (${eduDates})`, size: 18, color: "64748B" }),
            ],
            spacing: { before: 60, after: 60 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const rawName = contact.fullName || "Candidate";
    const sanitizedName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const objectKey = `resumes/docx/${resume.userId}_${resume._id}_v${version}_${sanitizedName}.docx`;

    const uploadResult = await uploadBufferToS3(
      docxBuffer,
      objectKey,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    logger.info({ resumeId: resume._id, url: uploadResult.url }, "[DOCX Generator] DOCX generated and stored in S3");

    return {
      status: "COMPLETED",
      key: uploadResult.objectKey,
      url: uploadResult.url,
      generatedAt: new Date(),
      version,
    };
  } catch (err) {
    logger.error({ resumeId: resume._id, err: err.message }, "[DOCX Generator] Failed to generate DOCX");
    throw new AppError(`Server DOCX generation failed: ${err.message}`, 500);
  }
};
