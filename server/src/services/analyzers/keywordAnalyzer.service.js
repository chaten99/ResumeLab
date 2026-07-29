const STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "our",
    "that",
    "the",
    "their",
    "this",
    "to",
    "was",
    "we",
    "will",
    "with",
    "you",
    "your",
]);

const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w+#.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const extractKeywords = (text) => {
    if (!text || typeof text !== "string") {
        return [];
    }

    const normalizedText = normalizeText(text);

    const words = normalizedText
        .split(" ")
        .map((word) => word.trim())
        .filter(
            (word) =>
                word.length >= 2 &&
                !STOP_WORDS.has(word)
        );

    return [...new Set(words)];
};

export const analyzeKeywords = (
    resumeText,
    targetRole,
    jobDescription = ""
) => {
    const normalizedResume = normalizeText(resumeText || "");

    const roleKeywords = extractKeywords(targetRole);
    const jobKeywords = extractKeywords(jobDescription);

    const requiredKeywords = [
        ...new Set([
            ...roleKeywords,
            ...jobKeywords,
        ]),
    ];

    const matchedKeywords = [];
    const missingKeywords = [];

    for (const keyword of requiredKeywords) {
        if (normalizedResume.includes(keyword)) {
            matchedKeywords.push(keyword);
        } else {
            missingKeywords.push(keyword);
        }
    }

    const matchPercentage =
        requiredKeywords.length > 0
            ? Math.round(
                  (matchedKeywords.length /
                      requiredKeywords.length) *
                      100
              )
            : null;

    return {
        matchedKeywords,
        missingKeywords,
        totalKeywords: requiredKeywords.length,
        matchedCount: matchedKeywords.length,
        matchPercentage,
    };
};