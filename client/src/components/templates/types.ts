export type ColorTheme = "indigo" | "emerald" | "crimson" | "amber" | "slate" | "violet";
export type TemplateId = "minimal" | "modern" | "professional" | "ats" | "creative" | "executive";

export interface ContactData {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  location?: string | null;
}

export interface SkillsData {
  technicalSkills?: string[];
  softSkills?: string[];
  tools?: string[];
  languages?: string[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  bullets?: string[];
}

export interface ProjectItem {
  title: string;
  description: string;
  techStack?: string[];
  links?: string[];
  bullets?: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  gpa?: string | null;
  details?: string[];
}

export interface CertificationItem {
  name: string;
  issuer?: string | null;
  date?: string | null;
  url?: string | null;
}

export interface AchievementItem {
  title: string;
  description: string;
  date?: string | null;
}

export interface StructuredResumeData {
  contact?: ContactData;
  summary?: string;
  skills?: SkillsData;
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
  education?: EducationItem[];
  certifications?: CertificationItem[];
  achievements?: AchievementItem[];
}

export interface TemplateProps {
  data: StructuredResumeData;
  colorTheme?: ColorTheme;
  targetRole?: string;
}
