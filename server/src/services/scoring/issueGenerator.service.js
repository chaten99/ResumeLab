const createIssue = (type, severity, message) => ({
    type,
    severity,
    message,
});

export const generateIssues = (metrics) => {
    const issues = [];

    const {
        structure,
        contact,
        content,
        keywords,
    } = metrics;
    
    const coreSections = [
        "experience",
        "education",
        "skills",
    ];

    for (const section of coreSections) {
        if (!structure.detectedSections.includes(section)) {
            issues.push(
                createIssue(
                    "structure",
                    "high",
                    `Missing ${section} section`
                )
            );
        }
    }

    if (!contact.email) {
        issues.push(
            createIssue(
                "contact",
                "high",
                "No email address detected"
            )
        );
    }

    if (!contact.phone) {
        issues.push(
            createIssue(
                "contact",
                "medium",
                "No phone number detected"
            )
        );
    }

    if (content.wordCount < 200) {
        issues.push(
            createIssue(
                "content",
                "medium",
                "Resume may be too short to communicate enough relevant experience"
            )
        );
    }

    if (content.wordCount > 1000) {
        issues.push(
            createIssue(
                "readability",
                "medium",
                "Resume may be unnecessarily long"
            )
        );
    }

    if (content.bulletCount === 0) {
        issues.push(
            createIssue(
                "content",
                "high",
                "No bullet points were detected"
            )
        );
    }

    if (content.bulletCount > 0) {
        const actionVerbRatio =
            content.actionVerbBulletCount /
            content.bulletCount;

        if (actionVerbRatio < 0.5) {
            issues.push(
                createIssue(
                    "impact",
                    "medium",
                    "Many bullet points do not start with strong action verbs"
                )
            );
        }

        const quantifiedRatio =
            content.quantifiedBulletCount /
            content.bulletCount;

        if (quantifiedRatio < 0.25) {
            issues.push(
                createIssue(
                    "impact",
                    "medium",
                    "Few bullet points contain measurable results or quantified impact"
                )
            );
        }
    }

    if (content.averageBulletLength > 30) {
        issues.push(
            createIssue(
                "readability",
                "medium",
                "Some bullet points may be too long and difficult to scan"
            )
        );
    }

    for (const phrase of content.weakPhrases) {
        issues.push(
            createIssue(
                "content",
                "low",
                `Weak phrase detected: "${phrase}"`
            )
        );
    }

    if (
        keywords.matchPercentage !== null &&
        keywords.matchPercentage < 40
    ) {
        issues.push(
            createIssue(
                "roleRelevance",
                "high",
                "Resume has low keyword alignment with the target role or job description"
            )
        );
    } else if (
        keywords.matchPercentage !== null &&
        keywords.matchPercentage < 60
    ) {
        issues.push(
            createIssue(
                "roleRelevance",
                "medium",
                "Resume could be better aligned with the target role or job description"
            )
        );
    }

    return issues;
};