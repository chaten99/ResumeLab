import React from "react";
import type { TemplateProps } from "./types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export const MinimalTemplate: React.FC<TemplateProps> = ({ data, colorTheme = "indigo", targetRole }) => {
  const contact = data?.contact || {};
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  const themeColorClass = {
    indigo: "text-indigo-600 border-indigo-600/30",
    emerald: "text-emerald-600 border-emerald-600/30",
    crimson: "text-rose-600 border-rose-600/30",
    amber: "text-amber-600 border-amber-600/30",
    slate: "text-slate-800 border-slate-800/30",
    violet: "text-violet-600 border-violet-600/30",
  }[colorTheme];

  return (
    <div className="w-full bg-white text-slate-900 font-sans p-8 md:p-12 shadow-sm rounded-xl space-y-6 text-xs leading-relaxed">
      <div className="border-b border-slate-200 pb-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{contact.fullName || "Candidate Name"}</h1>
        <p className={`font-semibold text-sm ${themeColorClass.split(" ")[0]}`}>{targetRole || "Full Stack Engineer"}</p>

        <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-1">
          {contact.email && <span className="flex items-center gap-1"><Mail className="size-3" />{contact.email}</span>}
          {contact.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{contact.phone}</span>}
          {contact.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{contact.location}</span>}
          {contact.linkedin && <span className="flex items-center gap-1"><Globe className="size-3" />{contact.linkedin}</span>}
          {contact.github && <span className="flex items-center gap-1"><Globe className="size-3" />{contact.github}</span>}
        </div>
      </div>

      {data?.summary && (
        <div className="space-y-1">
          <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${themeColorClass}`}>Summary</h2>
          <p className="text-slate-700 pt-1 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="space-y-3">
          <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${themeColorClass}`}>Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{exp.title} - <span className="font-normal text-slate-600">{exp.company}</span></span>
                <span className="text-[10px] text-slate-400 font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
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
        <div className="space-y-3">
          <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${themeColorClass}`}>Projects</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{proj.title}</span>
                {proj.techStack && proj.techStack.length > 0 && (
                  <span className="text-[10px] text-slate-500 font-mono">[{proj.techStack.join(", ")}]</span>
                )}
              </div>
              <p className="text-slate-600">{proj.description}</p>
              {proj.bullets && proj.bullets.length > 0 && (
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                  {proj.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {(skills.technicalSkills?.length || skills.tools?.length) ? (
        <div className="space-y-1">
          <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${themeColorClass}`}>Skills &amp; Tools</h2>
          <p className="text-slate-700 pt-1">
            <span className="font-bold text-slate-900">Technical: </span>
            {skills.technicalSkills?.join(", ")}
            {skills.tools && skills.tools.length > 0 && (
              <> | <span className="font-bold text-slate-900">Tools: </span>{skills.tools.join(", ")}</>
            )}
          </p>
        </div>
      ) : null}

      {education.length > 0 && (
        <div className="space-y-2">
          <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-1 ${themeColorClass}`}>Education</h2>
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
  );
};
