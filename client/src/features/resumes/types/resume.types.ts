export type ResumeStatus = "parsed" | "analyzing" | "completed" | "failed";

export interface Resume {
  id?: string;
  _id?: string;
  userId?: string;
  originalName: string;
  targetRole: string;
  jobDescription?: string;
  extractedText?: string;
  pageCount?: number | null;
  status: ResumeStatus;
  createdAt: string;
  updatedAt?: string;
}

export function getResumeId(resume: Resume): string {
  return resume.id || resume._id || "";
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface UploadResumeInput {
  file: File;
  targetRole: string;
  jobDescription?: string;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  resume: Resume;
}

export interface GetResumesResponse {
  success: boolean;
  count: number;
  resumes: Resume[];
}

export interface GetResumeResponse {
  success: boolean;
  resume: Resume;
}

export interface DeleteResumeResponse {
  success: boolean;
  message: string;
}

export type IssueSeverity = "low" | "medium" | "high";

export interface AnalysisScores {
  overall: number;
  ats: number;
  roleRelevance: number;
  content: number;
  impact: number;
  readability: number;
}

export interface AnalysisIssue {
  type: string;
  severity: IssueSeverity;
  message: string;
}

export interface StructureMetrics {
  detectedSections: string[];
  missingSections: string[];
}

export interface ContactMetrics {
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
}

export interface ContentMetrics {
  wordCount: number;
  bulletCount: number;
  averageBulletLength: number;
  actionVerbBulletCount: number;
  quantifiedBulletCount: number;
  weakPhrases: string[];
}

export interface KeywordMetrics {
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
  matchedCount: number;
  matchPercentage: number | null;
}

export interface AnalysisMetrics {
  structure: StructureMetrics;
  contact: ContactMetrics;
  content: ContentMetrics;
  keywords: KeywordMetrics;
}

export interface AiFeedback {
  title: string;
  description: string;
  severity: IssueSeverity;
}

export interface AiBulletFeedback {
  original: string;
  problem: string;
  suggestion: string;
  improvedExample: string | null;
}

export interface AiAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: AiFeedback[];
  missingSkills: string[];
  experienceFeedback: AiFeedback[];
  projectFeedback: AiFeedback[];
  bulletFeedback: AiBulletFeedback[];
  prioritizedSuggestions: string[];
}

export interface RecruiterPerspective {
  firstImpressionScore: number;
  firstImpressionExplanation: string;
  recruiterSummary: string;
  shortlistingProbability: {
    category: "Very High" | "High" | "Moderate" | "Low" | "Very Low";
    reasoning: string;
  };
  strengths: { title: string; description: string; importance: string }[];
  weaknesses: { title: string; description: string; severity: IssueSeverity }[];
  concerns: string[];
  recruiterNotes: string;
}

export interface AtsFormatting {
  formattingScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  detectedFeatures: {
    hasMultiColumnLayout: boolean;
    hasTables: boolean;
    hasIcons: boolean;
    hasHeaderFooterUsage: boolean;
    hasHyperlinks: boolean;
    emailValid: boolean;
    phoneValid: boolean;
    fontConsistent: boolean;
    headingConsistent: boolean;
    pageCount: number;
    fileSizeKb: number;
    emptySections: string[];
    compatibilityRisks: string[];
  };
  issues: { severity: IssueSeverity; message: string; category: string }[];
  suggestions: string[];
}

export interface GrammarWriting {
  writingScore: number;
  issues: { type: string; message: string; severity: IssueSeverity }[];
  suggestions: string[];
  strongSentences: string[];
  weakSentences: { sentence: string; reason: string }[];
  metrics: {
    passiveVoiceCount: number;
    buzzwordCount: number;
    fillerWordCount: number;
    repeatedWordCount: number;
    inconsistentTenseCount: number;
  };
}

export interface AchievementImpact {
  impactScore: number;
  achievementScore: number;
  quantificationScore: number;
  quantifiedBulletsCount: number;
  totalBulletsCount: number;
  actionVerbsCount: number;
  responsibilityVsAchievementRatio: number;
  strongBullets: string[];
  weakBullets: { bullet: string; issue: string }[];
  recommendations: string[];
}

export interface ExperienceItemAnalysis {
  roleTitle: string;
  company: string;
  qualityScore: number;
  roleRelevance: string;
  responsibilities: string[];
  achievements: string[];
  leadership: string;
  ownership: string;
  technicalComplexity: string;
  businessValue: string;
  improvementSuggestions: string[];
}

export interface ExperienceAnalysis {
  overallExperienceScore: number;
  items: ExperienceItemAnalysis[];
  detectedGaps: string[];
}

export interface ProjectItemAnalysis {
  projectName: string;
  projectScore: number;
  recruiterImpression: string;
  resumeValue: {
    level: "Excellent Resume Project" | "Strong Resume Project" | "Average Resume Project" | "Weak Resume Project";
    reasoning: string;
  };
  technicalHighlights: string[];
  missingOpportunities: string[];
  recruiterConcerns: string[];
  aiImprovementSuggestions: string[];
  technicalDifficulty: {
    level: "High" | "Medium" | "Standard";
    reasoning: string;
  };
}

export interface ProjectAnalysis {
  overallProjectScore: number;
  items: ProjectItemAnalysis[];
}

export interface ResumeAnalysis {
  _id?: string;
  id?: string;
  userId: string;
  resumeId: string;
  status: "pending" | "processing" | "completed" | "failed";
  metrics: AnalysisMetrics;
  scores: AnalysisScores;
  issues: AnalysisIssue[];
  aiAnalysis: AiAnalysis;
  recruiterPerspective?: RecruiterPerspective;
  atsFormatting?: AtsFormatting;
  grammarWriting?: GrammarWriting;
  achievementImpact?: AchievementImpact;
  experienceAnalysis?: ExperienceAnalysis;
  projectAnalysis?: ProjectAnalysis;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AnalyzeResumeResponse {
  success: boolean;
  message: string;
  analysis: ResumeAnalysis;
}

export interface GetAnalysisResponse {
  success: boolean;
  analysis: ResumeAnalysis;
}
