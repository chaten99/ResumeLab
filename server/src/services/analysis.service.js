import { analyzeStructure } from "./analyzers/structureAnalyzer.service.js";
import { analyzeContact } from "./analyzers/contactAnalyzer.service.js";
import { analyzeContent } from "./analyzers/contentAnalyzer.service.js";
import { analyzeKeywords } from "./analyzers/keywordAnalyzer.service.js";

import { analyzeAtsFormatting } from "./analyzers/atsFormattingAnalyzer.service.js";
import { analyzeGrammarAndWriting } from "./analyzers/grammarAnalyzer.service.js";
import { analyzeAchievementAndImpact } from "./analyzers/achievementAnalyzer.service.js";
import { analyzeExperienceSections } from "./analyzers/experienceAnalyzer.service.js";
import { analyzeProjectSections } from "./analyzers/projectAnalyzer.service.js";
import { analyzeRecruiterPerspective } from "./analyzers/recruiterPerspective.service.js";

import { calculateScores } from "./scoring/scoreEngine.service.js";
import { generateIssues } from "./scoring/issueGenerator.service.js";

import { analyzeResumeWithAI } from "./ai/resumeAnalysis.service.js";
import { extractStructuredResume } from "./ai/resumeExtractor.service.js";
import { sanitizeExtractedText } from "../utils/textSanitizer.js";
import Resume from "../models/resume.model.js";
import logger from "../config/logger.js";

export const runDeterministicAnalysis = (resume, structuredResume = null) => {
    if (!resume) {
        throw new Error("Resume is required for analysis");
    }

    const { targetRole, jobDescription } = resume;
    const extractedText = sanitizeExtractedText(resume.extractedText || "");

    const metrics = {
        structure: analyzeStructure(extractedText),
        contact: analyzeContact(extractedText),
        content: analyzeContent(extractedText),
        keywords: analyzeKeywords(extractedText, targetRole, jobDescription),
    };

    const scores = calculateScores(metrics);
    const issues = generateIssues(metrics);

    const atsFormatting = analyzeAtsFormatting(extractedText, metrics.contact);
    const grammarWriting = analyzeGrammarAndWriting(extractedText);
    const achievementImpact = analyzeAchievementAndImpact(extractedText, metrics.content);
    const experienceAnalysis = analyzeExperienceSections(extractedText, targetRole, [], structuredResume);
    const projectAnalysis = analyzeProjectSections(extractedText, [], structuredResume);

    const recruiterPerspective = analyzeRecruiterPerspective({
        scores,
        metrics,
        ai: {},
        targetRole,
    });

    return {
        metrics,
        scores,
        issues,
        issuesCount: issues.length,
        recruiterPerspective,
        atsFormatting,
        grammarWriting,
        achievementImpact,
        experienceAnalysis,
        projectAnalysis,
    };
};

export const runResumeAnalysis = async (resume) => {
    if (!resume) {
        throw new Error("Resume is required for analysis");
    }

    const cleanText = sanitizeExtractedText(resume.extractedText || "");

    let structuredResume = resume.structuredResume || null;

    if (!structuredResume) {
        try {
            structuredResume = await extractStructuredResume(cleanText);
            if (structuredResume && resume._id) {
                await Resume.findByIdAndUpdate(resume._id, { structuredResume });
            }
        } catch (extractErr) {
            logger.warn({ err: extractErr.message }, "Structured extraction fallback to text parsing");
        }
    }

    const sanitizedResume = { ...resume, extractedText: cleanText, structuredResume };

    const deterministic = runDeterministicAnalysis(sanitizedResume, structuredResume);

    const ai = await analyzeResumeWithAI({
        resumeText: cleanText,
        targetRole: resume.targetRole,
        jobDescription: resume.jobDescription,
        metrics: deterministic.metrics,
    });

    const experienceAnalysis = analyzeExperienceSections(
        cleanText,
        resume.targetRole,
        ai?.experienceFeedback || [],
        structuredResume
    );

    const projectAnalysis = analyzeProjectSections(
        cleanText,
        ai?.projectFeedback || [],
        structuredResume
    );

    const recruiterPerspective = analyzeRecruiterPerspective({
        scores: deterministic.scores,
        metrics: deterministic.metrics,
        ai,
        targetRole: resume.targetRole,
    });

    return {
        metrics: deterministic.metrics,
        scores: deterministic.scores,
        issues: deterministic.issues,
        issuesCount: deterministic.issues?.length || 0,
        ai,
        recruiterPerspective,
        atsFormatting: deterministic.atsFormatting,
        grammarWriting: deterministic.grammarWriting,
        achievementImpact: deterministic.achievementImpact,
        experienceAnalysis,
        projectAnalysis,
    };
};