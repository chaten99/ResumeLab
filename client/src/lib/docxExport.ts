import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import type { StructuredResumeData } from "@/components/templates/types";

export const generateDocxResume = async (data: StructuredResumeData, targetRole?: string): Promise<Blob> => {
  const contact = data?.contact || {};
  const summary = data?.summary || "";
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  const children: Paragraph[] = [];

  // Name Header
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

  // Contact Details Line
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

  // Summary Section
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
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const downloadDocxFile = async (data: StructuredResumeData, targetRole?: string) => {
  const blob = await generateDocxResume(data, targetRole);
  const rawName = data?.contact?.fullName || "Resume";
  const sanitizedName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${sanitizedName}_Resume.docx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
