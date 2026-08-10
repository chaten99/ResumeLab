import React from "react";
import type { TemplateProps } from "./types";

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data, colorTheme = "indigo", targetRole }) => {
  const contact = data?.contact || {};
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  const accentColorClass = {
    indigo: "border-indigo-800 text-indigo-900",
    emerald: "border-emerald-800 text-emerald-900",
    crimson: "border-rose-900 text-rose-950",
    amber: "border-amber-800 text-amber-900",
    slate: "border-slate-800 text-slate-900",
    violet: "border-violet-900 text-violet-950",
  }[colorTheme];

  return (
    <div className="w-full bg-white text-slate-900 font-serif p-8 md:p-12 shadow-md rounded-xl space-y-6 text-xs leading-relaxed border-t-8 border-slate-900">
      <div className="text-center space-y-2 border-b-2 border-slate-300 pb-4">
        <h1 className="text-3xl font-extrabold tracking-wide text-slate-900 uppercase font-serif">{contact.fullName || "Candidate Name"}</h1>
        <p className={`font-sans font-bold text-xs uppercase tracking-widest ${accentColorClass.split(" ")[1]}`}>{targetRole || "Full Stack Engineer"}</p>
        <p className="font-sans text-[11px] text-slate-600">
          {[contact.location, contact.phone, contact.email, contact.linkedin, contact.github]
            .filter(Boolean)
            .join(" • ")}
        </p>
      </div>

      {data?.summary && (
        <div className="space-y-1.5">
          <h2 className={`font-sans font-bold uppercase tracking-wider text-[11px] border-b-2 pb-0.5 ${accentColorClass.split(" ")[0]}`}>Executive Summary</h2>
          <p className="text-slate-800 leading-relaxed font-serif text-[12px]">{data.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="space-y-4">
          <h2 className={`font-sans font-bold uppercase tracking-wider text-[11px] border-b-2 pb-0.5 ${accentColorClass.split(" ")[0]}`}>Leadership &amp; Professional Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between font-bold text-slate-900 font-sans text-xs">
                <span>{exp.title} | <span className="font-serif italic font-normal">{exp.company}</span></span>
                <span className="text-[10px] text-slate-500 font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
              </div>
              {exp.bullets && (
                <ul className="list-disc list-inside text-slate-800 space-y-1 font-serif text-[11px]">
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
          <h2 className={`font-sans font-bold uppercase tracking-wider text-[11px] border-b-2 pb-0.5 ${accentColorClass.split(" ")[0]}`}>Key Directives &amp; Projects</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="space-y-0.5 font-serif">
              <div className="font-bold text-slate-900 font-sans">{proj.title}</div>
              <p className="text-slate-800 text-[11px]">{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {(skills.technicalSkills?.length || skills.tools?.length) ? (
        <div className="space-y-1 font-sans">
          <h2 className={`font-bold uppercase tracking-wider text-[11px] border-b-2 pb-0.5 ${accentColorClass.split(" ")[0]}`}>Core Competencies</h2>
          <p className="text-slate-800 text-xs">
            {skills.technicalSkills?.join(", ")}
            {skills.tools && skills.tools.length > 0 && ` • ${skills.tools.join(", ")}`}
          </p>
        </div>
      ) : null}

      {education.length > 0 && (
        <div className="space-y-2 font-serif">
          <h2 className={`font-sans font-bold uppercase tracking-wider text-[11px] border-b-2 pb-0.5 ${accentColorClass.split(" ")[0]}`}>Education &amp; Credentials</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between text-slate-900">
              <div>
                <span className="font-bold font-sans">{edu.degree}</span>, {edu.institution}
              </div>
              <span className="text-[10px] text-slate-500 font-sans">{edu.startDate} - {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
