export const sanitizeExtractedText = (text = "") => {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/(?:^|\n)\s*[-–—]*\s*(?:Page\s*\d+(?:\s*of\s*\d+)?|\d+\s*of\s*\d+)\s*[-–—]*\s*(?=\n|$)/gi, "")
    .replace(/(?:^|\n)\s*Page\s*\d+\s*(?=\n|$)/gi, "")
    .replace(/(?:^|\n)\s*[-–—_=*]{3,}\s*(?=\n|$)/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const isArtifactOrPageMarker = (str = "") => {
  if (!str) return true;
  const s = str.trim();
  if (s.length < 2) return true;

  if (/^[^\w\s]+$/.test(s)) return true;

  if (/^[a-z]/.test(s)) return true;

  if (/^[-–—]*\s*(?:Page\s*\d+|\d+\s*of\s*\d+)\s*[-–—]*$/i.test(s)) return true;
  if (/^Page\s*\d+/i.test(s)) return true;

  if (/^(EDUCATION|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|ACHIEVEMENTS|PUBLICATIONS|SUMMARY|CONTACT|LANGUAGES|PROJECTS|PERSONAL PROJECTS)$/i.test(s)) {
    return true;
  }

  return false;
};
