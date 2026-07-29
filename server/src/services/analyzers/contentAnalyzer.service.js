const ACTION_VERBS = [
    "achieved",
    "automated",
    "built",
    "created",
    "developed",
    "designed",
    "delivered",
    "implemented",
    "improved",
    "increased",
    "launched",
    "led",
    "managed",
    "optimized",
    "reduced",
    "resolved",
    "scaled",
    "streamlined",
    "integrated",
    "engineered",
    "deployed",
    "collaborated",
];

const WEAK_PHRASES = [
    "responsible for",
    "worked on",
    "helped with",
    "assisted with",
    "involved in",
    "participated in",
    "tasked with",
];

const BULLET_PATTERN = /^[•●▪◦‣⁃*-]\s+/;

const QUANTIFICATION_PATTERN =
    /(?:\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?\+|\b\d+(?:,\d{3})*(?:\.\d+)?\b)/;

const getWords = (text) => {
    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean);
};

const extractBullets = (text) => {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => BULLET_PATTERN.test(line))
        .map((line) => line.replace(BULLET_PATTERN, "").trim());
};

const startsWithActionVerb = (bullet) => {
    const firstWord = bullet
        .split(/\s+/)[0]
        ?.toLowerCase()
        .replace(/[^a-z]/g, "");

    return ACTION_VERBS.includes(firstWord);
};

const findWeakPhrases = (text) => {
    const lowerText = text.toLowerCase();

    return WEAK_PHRASES.filter((phrase) =>
        lowerText.includes(phrase)
    );
};

export const analyzeContent = (text) => {
    if (!text || typeof text !== "string") {
        return {
            wordCount: 0,
            bulletCount: 0,
            averageBulletLength: 0,
            actionVerbBulletCount: 0,
            quantifiedBulletCount: 0,
            weakPhrases: [],
        };
    }

    const words = getWords(text);
    const bullets = extractBullets(text);

    const actionVerbBulletCount = bullets.filter(
        startsWithActionVerb
    ).length;

    const quantifiedBulletCount = bullets.filter((bullet) =>
        QUANTIFICATION_PATTERN.test(bullet)
    ).length;

    const totalBulletWords = bullets.reduce(
        (total, bullet) => total + getWords(bullet).length,
        0
    );

    const averageBulletLength =
        bullets.length > 0
            ? Math.round(totalBulletWords / bullets.length)
            : 0;

    return {
        wordCount: words.length,
        bulletCount: bullets.length,
        averageBulletLength,
        actionVerbBulletCount,
        quantifiedBulletCount,
        weakPhrases: findWeakPhrases(text),
    };
};