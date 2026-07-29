import gemini from "../../config/gemini.js";
import { env } from "../../config/env.js";
import logger from "../../config/logger.js";
import AppError from "../../utils/AppError.js";

export const analyzeAtsKeywordsWithAi = async ({
    resumeText,
    targetRole,
    jobDescription,
}) => {
    const prompt = `
You are an advanced Applicant Tracking System (ATS) parser and technical recruiter.

Analyze the resume text against the target role and optional job description for keyword coverage and skill alignment.

TARGET ROLE:
${targetRole}

JOB DESCRIPTION:
${jobDescription || "No specific job description provided. Infer standard expectations for this target role."}

RESUME TEXT:
${resumeText}

CATEGORIES TO EXTRACT & EVALUATE:
1. technicalSkills
2. softSkills
3. tools
4. frameworks
5. databases
6. cloud
7. programmingLanguages

IMPORTANT MATCHING RULES:
- Perform SEMANTIC SIMILARITY MATCHING: Recognize equivalent terms (e.g., "React.js" = "React", "AWS" = "Amazon Web Services", "PostgreSQL" = "Postgres", "Node" = "Node.js", "Docker" = "Containerization"). If a semantic equivalent exists in the resume, count it as matched!
- For every missing keyword, provide a brief, clear explanation of WHY this skill matters for the candidate's target role.
- Calculate an accurate overall ATS Coverage Percentage (0 to 100%).

Return a single JSON object with this exact structure:
{
  "coveragePercentage": 75,
  "summary": "Concise overview of ATS keyword alignment and gaps",
  "categorizedSkills": {
    "technicalSkills": [
      { "name": "REST APIs", "matched": true, "importanceReason": null },
      { "name": "Microservices", "matched": false, "importanceReason": "Crucial for scalable enterprise backend architecture" }
    ],
    "softSkills": [],
    "tools": [],
    "frameworks": [],
    "databases": [],
    "cloud": [],
    "programmingLanguages": []
  }
}
`;

    try {
        const response = await gemini.models.generateContent({
            model: env.GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text;
        const parsed = JSON.parse(text);

        if (typeof parsed.coveragePercentage !== "number" || !parsed.categorizedSkills) {
            throw new Error("Invalid ATS Keyword Matcher output structure");
        }

        return parsed;
    } catch (error) {
        logger.error(
            {
                err: error,
                message: error.message,
            },
            "Gemini ATS Keyword Matcher generation failed"
        );

        throw new AppError("Failed to generate ATS keyword analysis", 502);
    }
};
