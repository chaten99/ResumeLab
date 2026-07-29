const clampScore = (score) => {
    return Math.max(0, Math.min(100, Math.round(score)));
};

const calculateAtsScore = ({ structure, contact }) => {
    let score = 100;

    const coreSections = [
        "experience",
        "education",
        "skills",
    ];

    for (const section of coreSections) {
        if (!structure.detectedSections.includes(section)) {
            score -= 15;
        }
    }

    if (!contact.email) score -= 15;
    if (!contact.phone) score -= 10;

    return clampScore(score);
};

const calculateContentScore = ({ structure, content }) => {
    let score = 100;

    if (content.wordCount < 200) {
        score -= 20;
    } else if (content.wordCount > 1000) {
        score -= 15;
    }

    if (content.bulletCount === 0) {
        score -= 20;
    }

    if (content.weakPhrases.length > 0) {
        score -= Math.min(
            content.weakPhrases.length * 5,
            20
        );
    }

    if (!structure.detectedSections.includes("experience")) {
        score -= 15;
    }

    return clampScore(score);
};

const calculateImpactScore = ({ content }) => {
    if (content.bulletCount === 0) {
        return 0;
    }

    const actionVerbRatio =
        content.actionVerbBulletCount /
        content.bulletCount;

    const quantifiedRatio =
        content.quantifiedBulletCount /
        content.bulletCount;

    const actionVerbScore = actionVerbRatio * 50;
    const quantifiedScore = quantifiedRatio * 50;

    return clampScore(
        actionVerbScore + quantifiedScore
    );
};

const calculateReadabilityScore = ({ content }) => {
    let score = 100;

    if (content.wordCount > 1000) {
        score -= 20;
    }

    if (content.averageBulletLength > 30) {
        score -= 20;
    } else if (content.averageBulletLength > 25) {
        score -= 10;
    }

    if (
        content.bulletCount > 0 &&
        content.averageBulletLength < 4
    ) {
        score -= 10;
    }

    return clampScore(score);
};

const calculateRoleRelevanceScore = ({ keywords }) => {
    if (keywords.matchPercentage === null) {
        return 50;
    }

    return clampScore(keywords.matchPercentage);
};

export const calculateScores = (analysis) => {
    const ats = calculateAtsScore(analysis);
    const content = calculateContentScore(analysis);
    const impact = calculateImpactScore(analysis);
    const readability =
        calculateReadabilityScore(analysis);
    const roleRelevance =
        calculateRoleRelevanceScore(analysis);

    const overall = clampScore(
        ats * 0.25 +
        roleRelevance * 0.25 +
        content * 0.20 +
        impact * 0.20 +
        readability * 0.10
    );

    return {
        overall,
        ats,
        roleRelevance,
        content,
        impact,
        readability,
    };
};