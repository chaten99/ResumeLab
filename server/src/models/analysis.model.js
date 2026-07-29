import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
    {
        overall: { type: Number, min: 0, max: 100, default: 0 },
        ats: { type: Number, min: 0, max: 100, default: 0 },
        roleRelevance: { type: Number, min: 0, max: 100, default: 0 },
        content: { type: Number, min: 0, max: 100, default: 0 },
        impact: { type: Number, min: 0, max: 100, default: 0 },
        readability: { type: Number, min: 0, max: 100, default: 0 },
    },
    { _id: false }
);

const issueSchema = new mongoose.Schema(
    {
        type: { type: String, required: true },
        severity: { type: String, enum: ["low", "medium", "high"], required: true },
        message: { type: String, required: true },
    },
    { _id: false }
);

const structureMetricsSchema = new mongoose.Schema(
    {
        detectedSections: { type: [String], default: [] },
        missingSections: { type: [String], default: [] },
    },
    { _id: false }
);

const contactMetricsSchema = new mongoose.Schema(
    {
        email: { type: String, default: null },
        phone: { type: String, default: null },
        linkedin: { type: String, default: null },
        github: { type: String, default: null },
        portfolio: { type: String, default: null },
    },
    { _id: false }
);

const contentMetricsSchema = new mongoose.Schema(
    {
        wordCount: { type: Number, default: 0 },
        bulletCount: { type: Number, default: 0 },
        averageBulletLength: { type: Number, default: 0 },
        actionVerbBulletCount: { type: Number, default: 0 },
        quantifiedBulletCount: { type: Number, default: 0 },
        weakPhrases: { type: [String], default: [] },
    },
    { _id: false }
);

const keywordMetricsSchema = new mongoose.Schema(
    {
        matchedKeywords: { type: [String], default: [] },
        missingKeywords: { type: [String], default: [] },
        totalKeywords: { type: Number, default: 0 },
        matchedCount: { type: Number, default: 0 },
        matchPercentage: { type: Number, default: null },
    },
    { _id: false }
);

const metricsSchema = new mongoose.Schema(
    {
        structure: { type: structureMetricsSchema, default: () => ({}) },
        contact: { type: contactMetricsSchema, default: () => ({}) },
        content: { type: contentMetricsSchema, default: () => ({}) },
        keywords: { type: keywordMetricsSchema, default: () => ({}) },
    },
    { _id: false }
);

const aiFeedbackSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        severity: { type: String, enum: ["low", "medium", "high"], required: true },
    },
    { _id: false }
);

const aiBulletFeedbackSchema = new mongoose.Schema(
    {
        original: { type: String, required: true },
        problem: { type: String, required: true },
        suggestion: { type: String, required: true },
        improvedExample: { type: String, default: null },
    },
    { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
    {
        summary: { type: String, default: "" },
        strengths: { type: [String], default: [] },
        weaknesses: { type: [aiFeedbackSchema], default: [] },
        missingSkills: { type: [String], default: [] },
        experienceFeedback: { type: [aiFeedbackSchema], default: [] },
        projectFeedback: { type: [aiFeedbackSchema], default: [] },
        bulletFeedback: { type: [aiBulletFeedbackSchema], default: [] },
        prioritizedSuggestions: { type: [String], default: [] },
    },
    { _id: false }
);

// NEW MODULAR SCHEMAS FOR 6 NEW ANALYSIS MODULES

// 1. Recruiter Perspective Schema
const recruiterPerspectiveSchema = new mongoose.Schema(
    {
        firstImpressionScore: { type: Number, min: 0, max: 100, default: 75 },
        firstImpressionExplanation: { type: String, default: "" },
        recruiterSummary: { type: String, default: "" },
        shortlistingProbability: {
            category: { type: String, enum: ["Very High", "High", "Moderate", "Low", "Very Low"], default: "Moderate" },
            reasoning: { type: String, default: "" },
        },
        strengths: [
            {
                title: { type: String, default: "" },
                description: { type: String, default: "" },
                importance: { type: String, default: "High" },
            },
        ],
        weaknesses: [
            {
                title: { type: String, default: "" },
                description: { type: String, default: "" },
                severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
            },
        ],
        concerns: { type: [String], default: [] },
        recruiterNotes: { type: String, default: "" },
    },
    { _id: false }
);

// 2. ATS Formatting Schema
const atsFormattingSchema = new mongoose.Schema(
    {
        formattingScore: { type: Number, min: 0, max: 100, default: 80 },
        riskLevel: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
        detectedFeatures: {
            hasMultiColumnLayout: { type: Boolean, default: false },
            hasTables: { type: Boolean, default: false },
            hasIcons: { type: Boolean, default: false },
            hasHeaderFooterUsage: { type: Boolean, default: false },
            hasHyperlinks: { type: Boolean, default: false },
            emailValid: { type: Boolean, default: true },
            phoneValid: { type: Boolean, default: true },
            fontConsistent: { type: Boolean, default: true },
            headingConsistent: { type: Boolean, default: true },
            pageCount: { type: Number, default: 1 },
            fileSizeKb: { type: Number, default: 150 },
            emptySections: { type: [String], default: [] },
            compatibilityRisks: { type: [String], default: [] },
        },
        issues: [
            {
                severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
                message: { type: String, default: "" },
                category: { type: String, default: "General" },
            },
        ],
        suggestions: { type: [String], default: [] },
    },
    { _id: false }
);

// 3. Grammar & Writing Schema
const grammarWritingSchema = new mongoose.Schema(
    {
        writingScore: { type: Number, min: 0, max: 100, default: 80 },
        issues: [
            {
                type: { type: String, default: "Style" },
                message: { type: String, default: "" },
                severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
            },
        ],
        suggestions: { type: [String], default: [] },
        strongSentences: { type: [String], default: [] },
        weakSentences: [
            {
                sentence: { type: String, default: "" },
                reason: { type: String, default: "" },
            },
        ],
        metrics: {
            passiveVoiceCount: { type: Number, default: 0 },
            buzzwordCount: { type: Number, default: 0 },
            fillerWordCount: { type: Number, default: 0 },
            repeatedWordCount: { type: Number, default: 0 },
            inconsistentTenseCount: { type: Number, default: 0 },
        },
    },
    { _id: false }
);

// 4. Achievement & Impact Schema
const achievementImpactSchema = new mongoose.Schema(
    {
        impactScore: { type: Number, min: 0, max: 100, default: 70 },
        achievementScore: { type: Number, min: 0, max: 100, default: 75 },
        quantificationScore: { type: Number, min: 0, max: 100, default: 65 },
        quantifiedBulletsCount: { type: Number, default: 0 },
        totalBulletsCount: { type: Number, default: 0 },
        actionVerbsCount: { type: Number, default: 0 },
        responsibilityVsAchievementRatio: { type: Number, default: 50 },
        strongBullets: { type: [String], default: [] },
        weakBullets: [
            {
                bullet: { type: String, default: "" },
                issue: { type: String, default: "" },
            },
        ],
        recommendations: { type: [String], default: [] },
    },
    { _id: false }
);

// 5. Experience Analysis Schema
const experienceItemAnalysisSchema = new mongoose.Schema(
    {
        roleTitle: { type: String, default: "" },
        company: { type: String, default: "" },
        qualityScore: { type: Number, min: 0, max: 100, default: 75 },
        roleRelevance: { type: String, default: "High" },
        responsibilities: { type: [String], default: [] },
        achievements: { type: [String], default: [] },
        leadership: { type: String, default: "" },
        ownership: { type: String, default: "" },
        technicalComplexity: { type: String, default: "" },
        businessValue: { type: String, default: "" },
        improvementSuggestions: { type: [String], default: [] },
    },
    { _id: false }
);

const experienceAnalysisSchema = new mongoose.Schema(
    {
        overallExperienceScore: { type: Number, min: 0, max: 100, default: 75 },
        items: { type: [experienceItemAnalysisSchema], default: [] },
        detectedGaps: { type: [String], default: [] },
    },
    { _id: false }
);

// 6. Project Analysis Schema
const projectItemAnalysisSchema = new mongoose.Schema(
    {
        projectName: { type: String, default: "" },
        projectScore: { type: Number, min: 0, max: 100, default: 75 },
        recruiterImpression: { type: String, default: "" },
        resumeValue: {
            level: {
                type: String,
                enum: [
                    "Excellent Resume Project",
                    "Strong Resume Project",
                    "Average Resume Project",
                    "Weak Resume Project",
                ],
                default: "Strong Resume Project",
            },
            reasoning: { type: String, default: "" },
        },
        technicalHighlights: { type: [String], default: [] },
        missingOpportunities: { type: [String], default: [] },
        recruiterConcerns: { type: [String], default: [] },
        aiImprovementSuggestions: { type: [String], default: [] },
        technicalDifficulty: {
            level: {
                type: String,
                enum: ["High", "Medium", "Standard"],
                default: "Medium",
            },
            reasoning: { type: String, default: "" },
        },
    },
    { _id: false }
);

const projectAnalysisSchema = new mongoose.Schema(
    {
        overallProjectScore: { type: Number, min: 0, max: 100, default: 75 },
        items: { type: [projectItemAnalysisSchema], default: [] },
    },
    { _id: false }
);

const analysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },

        metrics: {
            type: metricsSchema,
            default: () => ({}),
        },

        scores: {
            type: scoreSchema,
            default: () => ({}),
        },

        issues: {
            type: [issueSchema],
            default: [],
        },

        aiAnalysis: {
            type: aiAnalysisSchema,
            default: () => ({}),
        },

        // Extended 6 Analysis Modules
        recruiterPerspective: {
            type: recruiterPerspectiveSchema,
            default: () => ({}),
        },

        atsFormatting: {
            type: atsFormattingSchema,
            default: () => ({}),
        },

        grammarWriting: {
            type: grammarWritingSchema,
            default: () => ({}),
        },

        achievementImpact: {
            type: achievementImpactSchema,
            default: () => ({}),
        },

        experienceAnalysis: {
            type: experienceAnalysisSchema,
            default: () => ({}),
        },

        projectAnalysis: {
            type: projectAnalysisSchema,
            default: () => ({}),
        },

        errorMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

analysisSchema.index(
    { userId: 1, resumeId: 1 },
    { unique: true }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;