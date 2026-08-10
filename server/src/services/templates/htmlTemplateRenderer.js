export const renderResumeHtml = (data, templateId = "modern", colorTheme = "indigo", targetRole = "Full Stack Engineer") => {
  const contact = data?.contact || {};
  const summary = data?.summary || "";
  const skills = data?.skills || {};
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const education = data?.education || [];

  const colorPalettes = {
    indigo: { primary: "#4F46E5", dark: "#3730A3", light: "#EEF2FF", border: "#C7D2FE" },
    emerald: { primary: "#059669", dark: "#065F46", light: "#ECFDF5", border: "#A7F3D0" },
    crimson: { primary: "#E11D48", dark: "#9F1239", light: "#FFF1F2", border: "#FECDD3" },
    amber: { primary: "#D97706", dark: "#92400E", light: "#FFFBEB", border: "#FDE68A" },
    slate: { primary: "#0F172A", dark: "#020617", light: "#F1F5F9", border: "#CBD5E1" },
    violet: { primary: "#7C3AED", dark: "#5B21B6", light: "#F5F3FF", border: "#DDD6FE" },
  };

  const theme = colorPalettes[colorTheme] || colorPalettes.indigo;

  let bodyContent = "";

  if (templateId === "minimal") {
    bodyContent = `
      <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; color: #1e293b;">
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #0f172a;">${contact.fullName || "Candidate Name"}</h1>
          <p style="font-size: 14px; font-weight: 600; color: ${theme.primary}; margin: 4px 0 8px 0;">${targetRole}</p>
          <p style="font-size: 11px; color: #64748b; margin: 0;">
            ${[contact.email, contact.phone, contact.location, contact.linkedin, contact.github].filter(Boolean).join(" • ")}
          </p>
        </div>

        ${summary ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Professional Summary</h2>
            <p style="font-size: 12px; line-height: 1.6; color: #334155; margin: 0;">${summary}</p>
          </div>
        ` : ""}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px;">Work Experience</h2>
            ${experience.map(exp => `
              <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #0f172a;">
                  <span>${exp.title} <span style="font-weight: 400; color: #64748b;">at ${exp.company}</span></span>
                  <span style="font-size: 11px; color: #94a3b8; font-weight: 400;">${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}</span>
                </div>
                ${exp.bullets ? `
                  <ul style="margin: 6px 0 0 16px; padding: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                    ${exp.bullets.map(b => `<li style="margin-bottom: 4px;">${b}</li>`).join("")}
                  </ul>
                ` : ""}
              </div>
            `).join("")}
          </div>
        ` : ""}

        ${projects.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px;">Key Projects</h2>
            ${projects.map(proj => `
              <div style="margin-bottom: 12px;">
                <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">${proj.title}</p>
                <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.4;">${proj.description || ""}</p>
                ${proj.techStack?.length ? `
                  <p style="font-size: 10px; color: ${theme.primary}; font-weight: 600; margin: 0;">Stack: ${proj.techStack.join(", ")}</p>
                ` : ""}
              </div>
            `).join("")}
          </div>
        ` : ""}

        ${(skills.technicalSkills?.length || skills.tools?.length) ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Technical Skills &amp; Tools</h2>
            <p style="font-size: 11px; color: #334155; line-height: 1.6; margin: 0;">
              ${[...(skills.technicalSkills || []), ...(skills.tools || [])].join(" • ")}
            </p>
          </div>
        ` : ""}

        ${education.length > 0 ? `
          <div>
            <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Education</h2>
            ${education.map(edu => `
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #1e293b; margin-bottom: 4px;">
                <span><strong>${edu.degree}</strong>, ${edu.institution}</span>
                <span style="color: #94a3b8;">${edu.startDate || ""} - ${edu.endDate || ""}</span>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>
    `;
  } else {
    // Default Modern Template
    bodyContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #0f172a; width: 100%;">
        <div style="background-color: ${theme.primary}; color: #ffffff; padding: 32px 40px;">
          <h1 style="font-size: 30px; font-weight: 800; margin: 0; tracking: -0.5px;">${contact.fullName || "Candidate Name"}</h1>
          <p style="font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.9); margin: 4px 0 16px 0;">${targetRole}</p>
          <div style="font-size: 11px; color: rgba(255,255,255,0.85); border-t: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
            ${[contact.email, contact.phone, contact.location, contact.linkedin, contact.github].filter(Boolean).join("  |  ")}
          </div>
        </div>

        <div style="padding: 36px 40px;">
          ${summary ? `
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: ${theme.primary}; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Professional Summary</h2>
              <p style="font-size: 11.5px; line-height: 1.6; color: #334155; margin: 0;">${summary}</p>
            </div>
          ` : ""}

          ${experience.length > 0 ? `
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: ${theme.primary}; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px;">Work Experience</h2>
              ${experience.map(exp => `
                <div style="border-left: 2px solid ${theme.border}; padding-left: 12px; margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #0f172a;">
                    <span>${exp.title} <span style="font-weight: 400; color: #64748b;">at ${exp.company}</span></span>
                    <span style="font-size: 10px; color: #94a3b8; font-weight: 400;">${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}</span>
                  </div>
                  ${exp.bullets ? `
                    <ul style="margin: 6px 0 0 14px; padding: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                      ${exp.bullets.map(b => `<li style="margin-bottom: 3px;">${b}</li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${projects.length > 0 ? `
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: ${theme.primary}; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px;">Key Projects</h2>
              ${projects.map(proj => `
                <div style="margin-bottom: 12px;">
                  <p style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">${proj.title}</p>
                  <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.4;">${proj.description || ""}</p>
                  ${proj.techStack?.length ? `
                    <div style="margin-top: 4px;">
                      ${proj.techStack.map(t => `<span style="display: inline-block; background-color: ${theme.light}; color: ${theme.dark}; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">${t}</span>`).join("")}
                    </div>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${(skills.technicalSkills?.length || skills.tools?.length) ? `
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: ${theme.primary}; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Technical Skills &amp; Tools</h2>
              <div style="margin-top: 6px;">
                ${(skills.technicalSkills || []).map(s => `<span style="display: inline-block; background-color: ${theme.light}; color: ${theme.dark}; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin: 0 4px 4px 0;">${s}</span>`).join("")}
                ${(skills.tools || []).map(t => `<span style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin: 0 4px 4px 0;">${t}</span>`).join("")}
              </div>
            </div>
          ` : ""}

          ${education.length > 0 ? `
            <div>
              <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: ${theme.primary}; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Education</h2>
              ${education.map(edu => `
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #0f172a; margin-bottom: 4px;">
                  <span><strong>${edu.degree}</strong>, ${edu.institution}</span>
                  <span style="color: #94a3b8;">${edu.startDate || ""} - ${edu.endDate || ""}</span>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${contact.fullName || "Resume"}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; background: #ffffff; width: 100%; -webkit-print-color-adjust: exact; }
          @page { size: A4; margin: 0; }
        </style>
      </head>
      <body>
        ${bodyContent}
      </body>
    </html>
  `;
};
