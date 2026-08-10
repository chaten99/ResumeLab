import React from "react";
import type { TemplateProps } from "./types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, colorTheme = "indigo", targetRole }) => {
  const contact = data?.contact || {};
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  const sidebarBgClass = {
    indigo: "bg-indigo-900 text-white",
    emerald: "bg-emerald-900 text-white",
    crimson: "bg-rose-950 text-white",
    amber: "bg-amber-950 text-white",
    slate: "bg-slate-900 text-white",
    violet: "bg-violet-950 text-white",
  }[colorTheme];

  const headerColorClass = {
    indigo: "text-indigo-800 border-indigo-200",
    emerald: "text-emerald-800 border-emerald-200",
    crimson: "text-rose-800 border-rose-200",
    amber: "text-amber-800 border-amber-200",
    slate: "text-slate-900 border-slate-300",
    violet: "text-violet-800 border-violet-200",
  }[colorTheme];

  return (
    <div className="w-full bg-white text-slate-900 font-sans shadow-md rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 text-xs leading-relaxed">
      <div className={`p-6 space-y-6 ${sidebarBgClass}`}>
        <div className="space-y-1">
          <h1 className="text-xl font-bold leading-tight">{contact.fullName || "Candidate Name"}</h1>
          <p className="text-xs text-white/80 font-medium">{targetRole || "Full Stack Engineer"}</p>
        </div>

        <div className="space-y-3 pt-3 border-t border-white/20">
          <h2 className="font-bold uppercase tracking-wider text-[10px] text-white/90">Contact Details</h2>
          <div className="space-y-2 text-[11px] text-white/80">
            {contact.email && <div className="flex items-center gap-1.5"><Mail className="size-3 shrink-0" /><span className="truncate">{contact.email}</span></div>}
            {contact.phone && <div className="flex items-center gap-1.5"><Phone className="size-3 shrink-0" /><span>{contact.phone}</span></div>}
            {contact.location && <div className="flex items-center gap-1.5"><MapPin className="size-3 shrink-0" /><span>{contact.location}</span></div>}
            {contact.linkedin && <div className="flex items-center gap-1.5"><Globe className="size-3 shrink-0" /><span className="truncate">{contact.linkedin}</span></div>}
            {contact.github && <div className="flex items-center gap-1.5"><Globe className="size-3 shrink-0" /><span className="truncate">{contact.github}</span></div>}
          </div>
        </div>

        {(skills.technicalSkills?.length || skills.tools?.length) ? (
          <div className="space-y-3 pt-3 border-t border-white/20">
            <h2 className="font-bold uppercase tracking-wider text-[10px] text-white/90">Core Competencies</h2>
            <div className="space-y-1 text-[11px] text-white/80">
              {skills.technicalSkills?.map((skill, i) => (
                <div key={i} className="py-0.5">• {skill}</div>
              ))}
              {skills.tools?.map((tool, i) => (
                <div key={`t-${i}`} className="py-0.5">• {tool}</div>
              ))}
            </div>
          </div>
        ) : null}

        {education.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-white/20">
            <h2 className="font-bold uppercase tracking-wider text-[10px] text-white/90">Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} className="space-y-0.5 text-[11px]">
                <p className="font-bold text-white">{edu.degree}</p>
                <p className="text-white/70">{edu.institution}</p>
                <p className="text-[10px] text-white/50">{edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2 p-8 space-y-6 bg-white">
        {data?.summary && (
          <div className="space-y-1.5">
            <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${headerColorClass}`}>Executive Summary</h2>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="space-y-4">
            <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${headerColorClass}`}>Professional Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{exp.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <p className="text-slate-500 font-semibold text-[11px]">{exp.company}</p>
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
            <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${headerColorClass}`}>Key Projects</h2>
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{proj.title}</span>
                </div>
                <p className="text-slate-600">{proj.description}</p>
                {proj.bullets && (
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {proj.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
