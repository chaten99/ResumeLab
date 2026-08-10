import React from "react";
import type { TemplateProps } from "./types";
import { Mail, Phone, MapPin, Globe, Sparkles } from "lucide-react";

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, colorTheme = "indigo", targetRole }) => {
  const contact = data?.contact || {};
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  const gradientClass = {
    indigo: "from-indigo-600 to-violet-600",
    emerald: "from-emerald-600 to-teal-600",
    crimson: "from-rose-600 to-pink-600",
    amber: "from-amber-500 to-orange-600",
    slate: "from-slate-800 to-slate-950",
    violet: "from-violet-600 to-purple-700",
  }[colorTheme];

  const pillClass = {
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    crimson: "bg-rose-100 text-rose-800 border-rose-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    slate: "bg-slate-200 text-slate-900 border-slate-300",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
  }[colorTheme];

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans shadow-lg rounded-xl overflow-hidden text-xs leading-relaxed">
      <div className={`p-8 bg-gradient-to-r ${gradientClass} text-white space-y-3 relative`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              {contact.fullName || "Candidate Name"} <Sparkles className="size-5 text-white/80" />
            </h1>
            <p className="font-medium text-sm text-white/90">{targetRole || "Full Stack Engineer"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-[11px] text-white/90 pt-2 border-t border-white/20">
          {contact.email && <span className="flex items-center gap-1"><Mail className="size-3" />{contact.email}</span>}
          {contact.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{contact.phone}</span>}
          {contact.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{contact.location}</span>}
          {contact.linkedin && <span className="flex items-center gap-1"><Globe className="size-3" />{contact.linkedin}</span>}
          {contact.github && <span className="flex items-center gap-1"><Globe className="size-3" />{contact.github}</span>}
        </div>
      </div>

      <div className="p-8 space-y-6 bg-white">
        {data?.summary && (
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900">About Me</h2>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Experience Timeline</h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1.5 relative pl-4 border-l-2 border-slate-300">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{exp.title} <span className="font-normal text-slate-500">@ {exp.company}</span></span>
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
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Featured Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-900 text-xs block">{proj.title}</span>
                  <p className="text-slate-600 text-[11px]">{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.techStack.map((t, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${pillClass}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(skills.technicalSkills?.length || skills.tools?.length) ? (
          <div className="space-y-2">
            <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 border-b border-slate-200 pb-1">Skills &amp; Toolkit</h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.technicalSkills?.map((s, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${pillClass}`}>
                  {s}
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
