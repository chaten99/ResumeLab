export const analyzeRecruiterPerspective = ({
  scores = {},
  metrics = {},
  ai = {},
  targetRole = "Software Developer",
}) => {
  const overallScore = scores.overall || 75;

  const firstImpressionScore = Math.round(
    ((scores.readability || 80) * 0.4) + ((scores.ats || 70) * 0.3) + ((scores.roleRelevance || 75) * 0.3)
  );

  const firstImpressionExplanation =
    firstImpressionScore >= 80
      ? "Scannable layout, clear section headers, and rapid technical relevance identification within 6 seconds."
      : firstImpressionScore >= 65
      ? "Clean presentation overall, but some key metrics or technologies require scanning deeper into bullet points."
      : "Structure requires immediate attention; critical skills or contact details are difficult to parse in a quick scan.";

  const probabilityCategory =
    overallScore >= 85
      ? "Very High"
      : overallScore >= 75
      ? "High"
      : overallScore >= 60
      ? "Moderate"
      : overallScore >= 45
      ? "Low"
      : "Very Low";

  const probabilityReasoning =
    overallScore >= 75
      ? `Strong alignment with ${targetRole} standards. Solid evidence of technical competencies and structured project experience.`
      : overallScore >= 60
      ? `Competitive candidate profile for ${targetRole}, but bullet points need quantified impact metrics to stand out in top-tier applicant pools.`
      : `High risk of screening drop-off due to missing key technical keywords or unquantified experience bullets.`;

  const recruiterSummary =
    ai.summary ||
    `Candidate demonstrates a solid foundation for ${targetRole}. The resume exhibits clear section ordering and relevant technical stack usage.

To maximize interview callback rates, focus on converting responsibility-focused bullet points into metric-driven achievement statements (% latency cut, $ revenue generated, or user scale).

Overall, this profile shows strong potential once minor structural and keyword optimizations are applied.`;

  const strengths = (ai.strengths || []).map((str, idx) => ({
    title: `Key Strength #${idx + 1}`,
    description: str,
    importance: idx === 0 ? "High" : "Medium",
  }));

  if (strengths.length === 0) {
    strengths.push({
      title: "Target Role Alignment",
      description: `Technical skill set matches core expectations for ${targetRole}.`,
      importance: "High",
    });
  }

  const weaknesses = (ai.weaknesses || []).map((w) => ({
    title: w.title,
    description: w.description,
    severity: w.severity || "medium",
  }));

  const concerns = [];
  if (metrics.content?.quantifiedBulletCount < 3) {
    concerns.push("Missing measurable impact metrics across bullet points.");
  }
  if (metrics.content?.wordCount > 700) {
    concerns.push("Resume word count is high, increasing risk of recruiter fatigue during initial scan.");
  }
  if (!metrics.contact?.github && !metrics.contact?.portfolio) {
    concerns.push("No GitHub or live portfolio links provided for direct code evaluation.");
  }

  const recruiterNotes =
    ai.sixSecondVerdict ||
    `Solid technical background for ${targetRole}. Projects demonstrate practical knowledge, but adding quantified impact metrics will significantly boost callback confidence.`;

  return {
    firstImpressionScore,
    firstImpressionExplanation,
    recruiterSummary,
    shortlistingProbability: {
      category: probabilityCategory,
      reasoning: probabilityReasoning,
    },
    strengths,
    weaknesses,
    concerns: concerns.length > 0 ? concerns : ["No critical red flag concerns detected."],
    recruiterNotes,
  };
};
