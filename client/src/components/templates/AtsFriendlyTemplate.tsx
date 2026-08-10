import React from "react";
import type { TemplateProps } from "./types";

export const AtsFriendlyTemplate: React.FC<TemplateProps> = ({ data, targetRole }) => {
  const contact = data?.contact || {};
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  return (
    <div className="w-full bg-white text-black font-sans p-8 md:p-10 shadow-sm rounded-xl space-y-5 text-xs leading-relaxed border border-slate-200">
      <div className="text-center space-y-1 border-b border-black pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-black">{contact.fullName || "CANDIDATE NAME"}</h1>
        <p className="text-xs font-semibold uppercase tracking-wider">{targetRole || "FULL STACK ENGINEER"}</p>
        <p className="text-[11px] text-slate-700">
          {[contact.location, contact.phone, contact.email, contact.linkedin, contact.github]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>

      {data?.summary && (
        <div className="space-y-1">
          <h2 className="font-bold uppercase tracking-wider text-[11px] border-b border-black pb-0.5">PROFESSIONAL SUMMARY</h2>
          <p className="text-slate-800 leading-normal">{data.summary}</p>
        </div>
      )}

      {(skills.technicalSkills?.length || skills.tools?.length) ? (
        <div className="space-y-1">
          <h2 className="font-bold uppercase tracking-wider text-[11px] border-b border-black pb-0.5">TECHNICAL SKILLS</h2>
          <p className="text-slate-800">
            {skills.technicalSkills?.join(", ")}
            {skills.tools && skills.tools.length > 0 && `, ${skills.tools.join(", ")}`}
          </p>
        </div>
      ) : null}

      {experience.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold uppercase tracking-wider text-[11px] border-b border-black pb-0.5">WORK EXPERIENCE</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between font-bold text-black">
                <span>{exp.title} - {exp.company}</span>
                <span className="font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
              </div>
              {exp.bullets && (
                <ul className="list-disc list-inside text-slate-800 space-y-0.5">
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
          <h2 className="font-bold uppercase tracking-wider text-[11px] border-b border-black pb-0.5">PROJECTS</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="font-bold text-black">{proj.title}</div>
              <p className="text-slate-800">{proj.description}</p>
              {proj.bullets && (
                <ul className="list-disc list-inside text-slate-800 space-y-0.5">
                  {proj.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-bold uppercase tracking-wider text-[11px] border-b border-black pb-0.5">EDUCATION</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between text-black">
              <div>
                <span className="font-bold">{edu.degree}</span>, {edu.institution}
              </div>
              <span>{edu.startDate} - {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
