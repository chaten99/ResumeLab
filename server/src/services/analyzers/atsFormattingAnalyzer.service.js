export const analyzeAtsFormatting = (text = "", contactMetrics = {}) => {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  const emailValid = Boolean(
    contactMetrics.email || /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text)
  );
  const phoneValid = Boolean(
    contactMetrics.phone || /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)
  );

  const hasTables = /\|.*\|/.test(text) || /\b(table|cell|col)\b/i.test(text);
  const hasIcons = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text);
  const hasMultiColumnLayout = Boolean(
    lines.some((line) => line.split(/\s{4,}/).length > 2)
  );

  const hasHeaderFooterUsage = /header|footer|page \d+ of \d+/i.test(text);
  const hasHyperlinks = /https?:\/\/[^\s]+/.test(text);

  const pageCount = Math.max(1, Math.ceil(text.length / 3000));
  const fileSizeKb = Math.round(text.length / 10);

  const issues = [];
  const suggestions = [];
  const compatibilityRisks = [];

  if (hasTables) {
    compatibilityRisks.push("Tables detected in layout (causes parser column misread)");
    issues.push({
      severity: "high",
      message: "Tables present in layout can cause ATS parsers to skip or scramble text.",
      category: "Layout",
    });
    suggestions.push("Remove tables and use single-column linear text blocks.");
  }

  if (hasMultiColumnLayout) {
    compatibilityRisks.push("Multi-column layout structure detected");
    issues.push({
      severity: "medium",
      message: "Multi-column text can be parsed out of order by older ATS scanners.",
      category: "Layout",
    });
    suggestions.push("Convert multi-column sections to simple top-to-bottom single column.");
  }

  if (hasIcons) {
    compatibilityRisks.push("Special graphic icons or emojis detected");
    issues.push({
      severity: "low",
      message: "Icon glyphs may render as broken symbols in plain text ATS extracts.",
      category: "Typography",
    });
    suggestions.push("Replace graphic icons with plain text headers.");
  }

  if (!emailValid) {
    issues.push({
      severity: "high",
      message: "Valid email address not clearly parsed in top contact section.",
      category: "Contact",
    });
    suggestions.push("Ensure your email address is listed clearly in plain text at the top.");
  }

  if (!phoneValid) {
    issues.push({
      severity: "medium",
      message: "Phone number format not clearly recognized.",
      category: "Contact",
    });
    suggestions.push("Include a standard phone number (e.g., +1 555-123-4567).");
  }

  if (pageCount > 2) {
    issues.push({
      severity: "medium",
      message: `Resume length (${pageCount} pages) exceeds standard recruiter scanning preference.`,
      category: "Structure",
    });
    suggestions.push("Trim resume content to 1 or 2 pages maximum.");
  }

  let penalty = 0;
  issues.forEach((i) => {
    if (i.severity === "high") penalty += 20;
    if (i.severity === "medium") penalty += 10;
    if (i.severity === "low") penalty += 5;
  });

  const formattingScore = Math.max(20, 100 - penalty);
  const riskLevel =
    formattingScore >= 85
      ? "Low"
      : formattingScore >= 70
      ? "Medium"
      : formattingScore >= 50
      ? "High"
      : "Critical";

  return {
    formattingScore,
    riskLevel,
    detectedFeatures: {
      hasMultiColumnLayout,
      hasTables,
      hasIcons,
      hasHeaderFooterUsage,
      hasHyperlinks,
      emailValid,
      phoneValid,
      fontConsistent: true,
      headingConsistent: true,
      pageCount,
      fileSizeKb,
      emptySections: [],
      compatibilityRisks,
    },
    issues,
    suggestions: suggestions.length > 0 ? suggestions : ["Your formatting is clean and highly ATS compatible."],
  };
};
