import gemini from "../../config/gemini.js";
import { env } from "../../config/env.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import { structuredResumeSchema } from "../../schemas/structuredResume.schema.js";

const buildExtractionPrompt = (rawText, previousError = null) => {
  let prompt = `You are a high-precision, strict JSON resume parser and data extractor.
Your ONLY task is to parse the raw resume text provided below into clean, accurate, structured JSON.

CRITICAL EXTRACTION RULES:
- Perform PURE DATA EXTRACTION ONLY.
- DO NOT generate scores, ratings, recommendations, recruiter comments, or analysis.
- MUST EXTRACT EVERY SINGLE PROJECT in the PROJECTS section. If the resume lists 4 projects (e.g. QuickTalk, Doc-Sign, ShopVerse, ERP System), return ALL 4 projects in the "projects" array. Do NOT stop after the first project or collapse them into one.
- MUST EXTRACT EVERY SINGLE WORK EXPERIENCE entry and bullet point.
- Do NOT fabricate facts. If a field (e.g. portfolio URL) is missing, set it to null.
- Discard PDF artifacts, page numbers (e.g. "-- 1 of 2 --"), headers, and footers. Do NOT use page markers as project or job titles.

RAW RESUME TEXT:
${rawText}

OUTPUT FORMAT:
Return a single, raw JSON object matching this exact schema:
{
  "contact": {
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "linkedin": "...",
    "github": "...",
    "portfolio": "...",
    "location": "..."
  },
  "skills": {
    "technicalSkills": ["..."],
    "softSkills": ["..."],
    "tools": ["..."],
    "languages": ["..."]
  },
  "experience": [
    {
      "title": "...",
      "company": "...",
      "location": "...",
      "startDate": "...",
      "endDate": "...",
      "current": false,
      "bullets": ["..."]
    }
  ],
  "projects": [
    {
      "title": "...",
      "description": "...",
      "techStack": ["..."],
      "links": ["..."],
      "bullets": ["..."]
    }
  ],
  "education": [
    {
      "degree": "...",
      "institution": "...",
      "fieldOfStudy": "...",
      "startDate": "...",
      "endDate": "...",
      "gpa": "...",
      "details": ["..."]
    }
  ],
  "certifications": [
    {
      "name": "...",
      "issuer": "...",
      "date": "...",
      "url": "..."
    }
  ],
  "achievements": [
    {
      "title": "...",
      "description": "...",
      "date": "..."
    }
  ]
}
`;

  if (previousError) {
    prompt += `\n\nPREVIOUS ATTEMPT ISSUES:\n${JSON.stringify(previousError)}\nPlease fix these issues and ensure ALL projects and experience entries are completely extracted.`;
  }

  return prompt;
};

export const extractStructuredResume = async (rawText) => {
  if (!rawText || !rawText.trim()) {
    throw new AppError("No readable text provided for extraction", 400);
  }

  let prompt = buildExtractionPrompt(rawText);
  let attempt = 0;
  let lastError = null;

  const textHasProjects = /(?:PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS|TECHNICAL PROJECTS)\b/i.test(rawText);

  while (attempt < 2) {
    attempt++;
    try {
      const response = await gemini.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      if (!response || !response.text) {
        throw new Error("Gemini returned an empty extraction response");
      }

      const parsedJSON = JSON.parse(response.text);
      const validationResult = structuredResumeSchema.safeParse(parsedJSON);

      if (validationResult.success) {
        const data = validationResult.data;

        if (textHasProjects && data.projects.length === 0 && attempt === 1) {
          logger.warn("PROJECTS section detected in text but 0 projects extracted by Gemini; retrying...");
          prompt = buildExtractionPrompt(
            rawText,
            "The resume text clearly contains a PROJECTS section, but 0 projects were extracted in the projects array. Extract ALL projects."
          );
          continue;
        }

        return data;
      }

      lastError = validationResult.error.format();
      logger.warn({ attempt, err: lastError }, "Gemini structured extraction failed Zod validation, retrying...");
      prompt = buildExtractionPrompt(rawText, lastError);
    } catch (err) {
      logger.error({ attempt, err: err.message }, "Error during Gemini structured resume extraction");
      lastError = err.message;
      prompt = buildExtractionPrompt(rawText, { error: err.message });
    }
  }

  logger.error({ err: lastError }, "Structured resume extraction failed after retry");
  throw new AppError("Failed to parse structured resume data", 422);
};
