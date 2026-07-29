export interface AtsSkillItem {
  name: string;
  matched: boolean;
  importanceReason: string | null;
}

export interface CategorizedSkills {
  technicalSkills: AtsSkillItem[];
  softSkills: AtsSkillItem[];
  tools: AtsSkillItem[];
  frameworks: AtsSkillItem[];
  databases: AtsSkillItem[];
  cloud: AtsSkillItem[];
  programmingLanguages: AtsSkillItem[];
}

export interface AtsMatchRecord {
  _id?: string;
  id?: string;
  userId: string;
  resumeId: string;
  coveragePercentage: number;
  summary: string;
  categorizedSkills: CategorizedSkills;
  createdAt: string;
  updatedAt?: string;
}

export interface RunAtsMatchInput {
  jobDescription?: string;
}

export interface GetAtsMatchResponse {
  success: boolean;
  atsMatch: AtsMatchRecord;
}
