import gemini from "../../config/gemini.js";
import { env } from "../../config/env.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";
import { structuredResumeSchema } from "../../schemas/structuredResume.schema.js";

export const EXTRACTION_PROMPT_VERSION = "v1.1";

const buildTranscriptExtractionPrompt = (transcriptText, targetRole = "Full Stack Engineer") => {
  return `You are an executive HR Recruiter and Resume Extraction Engine.
Your ONLY job is to extract factual, resume-relevant information from the candidate's spoken self-introduction transcript provided below.

TARGET ROLE / POSITION: ${targetRole}
PROMPT VERSION: ${EXTRACTION_PROMPT_VERSION}

CRITICAL EXTRACTION RULES:
1. STRICT ZERO HALLUCINATION POLICY:
   - Extract ONLY facts explicitly spoken in the transcript.
   - NEVER invent, guess, or fabricate:
     * Company names
     * Job titles
     * Employment dates or durations
     * Technologies or programming languages
     * Project names or descriptions
     * Metrics or percentages (e.g. if candidate says "I improved performance", do NOT write "by 40%" unless 40% was spoken)
     * Degrees, universities, or CGPA
     * Certifications or awards
   - If a field or detail was not spoken, return null, empty string "", or empty array [].

2. CLEAN SPEECH PROCESSING:
   - Strip out filler words ("um", "uh", "like", "basically", "you know", "sort of").
   - Filter out greetings ("Hello", "Hi everyone", "Good morning"), casual chatter, jokes, and background noise.
   - Retain 100% of the candidate's factual professional experience, skills, and projects.

3. STRUCTURED DATA MAPPING:
   - Personal Info: Full Name, email, phone, location, LinkedIn, GitHub, portfolio links (only if mentioned).
   - Professional Summary: A concise, polished 2-3 sentence executive summary based strictly on spoken details.
   - Skills: Separate into technicalSkills, softSkills, tools, and languages.
   - Experience: List companies, roles, dates (if spoken), and bullet points describing responsibilities and impact.
   - Projects: List project titles, descriptions, tech stack, and links (if spoken).
   - Education: List degree, institution, field of study, and dates (if spoken).
   - Certifications & Achievements: List certifications and awards explicitly mentioned.

RAW TRANSCRIPT:
${transcriptText}

OUTPUT FORMAT:
Return a single, raw JSON object adhering to this exact JSON structure:
{
  "contact": {
    "fullName": "...",
    "email": null,
    "phone": null,
    "linkedin": null,
    "github": null,
    "portfolio": null,
    "location": null
  },
  "summary": "...",
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
      "location": null,
      "startDate": null,
      "endDate": null,
      "current": false,
      "bullets": ["..."]
    }
  ],
  "projects": [
    {
      "title": "...",
      "description": "...",
      "techStack": ["..."],
      "links": [],
      "bullets": ["..."]
    }
  ],
  "education": [
    {
      "degree": "...",
      "institution": "...",
      "fieldOfStudy": null,
      "startDate": null,
      "endDate": null,
      "gpa": null,
      "details": []
    }
  ],
  "certifications": [],
  "achievements": []
}`;
};

export const extractStructuredDataFromTranscript = async (transcriptText, targetRole = "Full Stack Engineer") => {
  if (!transcriptText || !transcriptText.trim()) {
    return {
      contact: { fullName: null, email: null, phone: null, linkedin: null, github: null, portfolio: null, location: null },
      summary: "",
      skills: { technicalSkills: [], softSkills: [], tools: [], languages: [] },
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      achievements: [],
    };
  }

  const prompt = buildTranscriptExtractionPrompt(transcriptText, targetRole);

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
      throw new Error("Gemini returned empty structured extraction response");
    }

    const parsedJSON = JSON.parse(response.text);
    const validationResult = structuredResumeSchema.safeParse(parsedJSON);

    if (validationResult.success) {
      logger.info(
        {
          version: EXTRACTION_PROMPT_VERSION,
          projects: validationResult.data.projects?.length,
          experience: validationResult.data.experience?.length,
          skills: validationResult.data.skills?.technicalSkills?.length,
        },
        "[Transcript Extractor v1.1] Successfully extracted structured resume data"
      );
      return validationResult.data;
    }

    logger.warn({ err: validationResult.error.format() }, "[Transcript Extractor] Zod validation fallback applied");
    return parsedJSON;
  } catch (err) {
    logger.error({ err: err.message }, "[Transcript Extractor] Gemini extraction error");
    throw new AppError(`Failed to extract resume details from transcript: ${err.message}`, 500);
  }
};
