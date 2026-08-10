import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  linkedin: z.string().nullable().default(null),
  github: z.string().nullable().default(null),
  portfolio: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
});

export const skillsSchema = z.object({
  technicalSkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

export const experienceItemSchema = z.object({
  title: z.string().default(""),
  company: z.string().default(""),
  location: z.string().nullable().default(null),
  startDate: z.string().nullable().default(null),
  endDate: z.string().nullable().default(null),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  links: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
});

export const educationItemSchema = z.object({
  degree: z.string().default(""),
  institution: z.string().default(""),
  fieldOfStudy: z.string().nullable().default(null),
  startDate: z.string().nullable().default(null),
  endDate: z.string().nullable().default(null),
  gpa: z.string().nullable().default(null),
  details: z.array(z.string()).default([]),
});

export const certificationItemSchema = z.object({
  name: z.string().default(""),
  issuer: z.string().nullable().default(null),
  date: z.string().nullable().default(null),
  url: z.string().nullable().default(null),
});

export const achievementItemSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  date: z.string().nullable().default(null),
});

export const structuredResumeSchema = z.object({
  contact: contactSchema,
  summary: z.string().default(""),
  skills: skillsSchema,
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  education: z.array(educationItemSchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
  achievements: z.array(achievementItemSchema).default([]),
});
