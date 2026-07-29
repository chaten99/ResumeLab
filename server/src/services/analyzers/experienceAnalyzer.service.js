import { sanitizeExtractedText, isArtifactOrPageMarker } from "../../utils/textSanitizer.js";

export const analyzeExperienceSections = (
  text = "",
  targetRole = "Software Developer",
  aiExperienceFeedback = [],
  structuredResume = null
) => {
  const items = [];
  const detectedGaps = [];

  const rawExperience = structuredResume?.experience && structuredResume.experience.length > 0
    ? structuredResume.experience
    : [];

  if (rawExperience.length > 0) {
    rawExperience.forEach((exp, idx) => {
      let roleTitle = (exp.title || `${targetRole} Role #${idx + 1}`).trim();
      if (isArtifactOrPageMarker(roleTitle)) roleTitle = `${targetRole} Role #${idx + 1}`;

      const company = (exp.company || "Professional Employer").trim();
      const bullets = exp.bullets || [];
      const isQuantified = bullets.some((b) => /\d+%|\$\d+|\d+/.test(b));

      const fb = aiExperienceFeedback[idx];

      items.push({
        roleTitle: roleTitle.slice(0, 50),
        company: company.slice(0, 50),
        qualityScore: isQuantified ? 85 : 72,
        roleRelevance: "High",
        responsibilities: bullets.slice(0, 2).map((b) => b.replace(/^[-•*]\s*/, "")),
        achievements: bullets.filter((b) => /\d/.test(b)).map((b) => b.replace(/^[-•*]\s*/, "")),
        leadership: "Demonstrated technical ownership and engineering task delivery.",
        ownership: "Full lifecycle responsibility for assigned deliverables.",
        technicalComplexity: fb ? fb.title : "High technical relevance to target role stack.",
        businessValue: fb ? fb.description : "Directly supported team engineering throughput.",
        improvementSuggestions: isQuantified
          ? ["Highlight system scale or user volume."]
          : ["Incorporate specific percentages or performance gains."],
      });
    });
  } else {
    const cleanText = sanitizeExtractedText(text);

    const expMatch = cleanText.match(
      /(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE)([\s\S]*?)(?:PROJECTS|EDUCATION|SKILLS|CERTIFICATIONS|$)/i
    );

    const expSectionText = expMatch ? expMatch[1] : cleanText;

    const blocks = expSectionText
      .split(/\n(?=[A-Z0-9\s]{3,30}\s*[-–|]\s*|20\d{2}|Present)/i)
      .map((b) => b.trim())
      .filter((b) => b.length > 30 && !isArtifactOrPageMarker(b));

    if (blocks.length === 0) {
      items.push({
        roleTitle: targetRole,
        company: "Professional Work Experience",
        qualityScore: 75,
        roleRelevance: "High",
        responsibilities: ["Developed core features and maintained code quality."],
        achievements: ["Delivered key technical projects on schedule."],
        leadership: "Individual contributor with collaborative cross-functional impact.",
        ownership: "Owned feature delivery across sprint cycles.",
        technicalComplexity: "Standard industry technical stack and engineering practices.",
        businessValue: "Contributed to core application uptime and product reliability.",
        improvementSuggestions: ["Add specific performance numbers to quantify your work."],
      });
    } else {
      blocks.slice(0, 4).forEach((block, idx) => {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => Boolean(l) && !isArtifactOrPageMarker(l));

        const titleLine = lines[0] || `${targetRole} Role #${idx + 1}`;
        const bullets = lines.filter((l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*"));
        const isQuantified = bullets.some((b) => /\d+%|\$\d+|\d+/.test(b));

        const fb = aiExperienceFeedback[idx];

        items.push({
          roleTitle: titleLine.slice(0, 50),
          company: "Work History Entry",
          qualityScore: isQuantified ? 82 : 70,
          roleRelevance: "High",
          responsibilities: bullets.slice(0, 2).map((b) => b.replace(/^[-•*]\s*/, "")),
          achievements: bullets.filter((b) => /\d/.test(b)).map((b) => b.replace(/^[-•*]\s*/, "")),
          leadership: "Demonstrated technical ownership in daily engineering tasks.",
          ownership: "Full lifecycle responsibility for assigned deliverables.",
          technicalComplexity: fb ? fb.title : "High technical relevance to target stack.",
          businessValue: fb ? fb.description : "Directly supported team engineering throughput.",
          improvementSuggestions: isQuantified
            ? ["Highlight system scale or user volume."]
            : ["Incorporate specific percentages or performance gains."],
        });
      });
    }
  }

  const overallScore = Math.round(
    items.reduce((acc, curr) => acc + curr.qualityScore, 0) / (items.length || 1)
  );

  return {
    overallExperienceScore: overallScore,
    items,
    detectedGaps,
  };
};
