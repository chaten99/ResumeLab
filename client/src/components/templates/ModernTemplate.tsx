import React from "react";
import type { TemplateProps } from "./types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export const ModernTemplate: React.FC<TemplateProps> = ({ data, colorTheme = "indigo", targetRole }) => {
  const contact = data?.contact || {};
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  const themeBgClass = {
    indigo: "bg-indigo-600 text-white",
    emerald: "bg-emerald-600 text-white",
    crimson: "bg-rose-600 text-white",
    amber: "bg-amber-600 text-white",
    slate: "bg-slate-900 text-white",
    violet: "bg-violet-600 text-white",
  }[colorTheme];

  const badgeClass = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    crimson: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-800 border-slate-300",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  }[colorTheme];

  return (
    <div className="w-full bg-white text-slate-900 font-sans shadow-md rounded-xl overflow-hidden text-xs leading-relaxed">
      <div className={`p-8 space-y-3 ${themeBgClass}`}>
        <h1 className="text-3xl font-extrabold tracking-tight">{contact.fullName || "Candidate Name"}</h1>
        <p className="font-medium text-sm text-white/90">{targetRole || "Full Stack Engineer"}</p>

        <div className="flex flex-wrap gap-4 text-[11px] text-white/80 pt-2 border-t border-white/20">
          {contact.email && <span className="flex items-center gap-1"><Mail className="size-3" />{contact.email}</span>}
          {contact.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{contact.phone}</span>}
          {contact.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{contact.location}</span>}
          {contact.linkedin && <span className="flex items-center gap-1"><Globe className="size-3" />{contact.linkedin}</span>}
          {contact.github && <span className="flex items-center gap-1"><Globe className="size-3" />{contact.github}</span>}
        </div>
      </div>

      <div className="p-8 space-y-6">
        {data?.summary && (
          <div className="space-y-1.5">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Professional Summary</h2>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Work Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1.5 border-l-2 border-slate-200 pl-3">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{exp.title} <span className="font-normal text-slate-500">at {exp.company}</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.bullets && (
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Key Projects</h2>
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{proj.title}</span>
                </div>
                <p className="text-slate-600">{proj.description}</p>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack.map((tech, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(skills.technicalSkills?.length || skills.tools?.length) ? (
          <div className="space-y-2">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Technical Skills &amp; Tools</h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.technicalSkills?.map((skill, i) => (
                <span key={i} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${badgeClass}`}>
                  {skill}
                </span>
              ))}
              {skills.tools?.map((tool, i) => (
                <span key={`t-${i}`} className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {education.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between text-slate-800">
                <div>
                  <span className="font-bold">{edu.degree}</span>, {edu.institution}
                </div>
                <span className="text-[10px] text-slate-400">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
