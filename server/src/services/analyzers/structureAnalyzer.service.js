const SECTION_PATTERNS = {
    summary: [
        "summary",
        "professional summary",
        "profile",
        "objective",
        "career objective",
    ],

    experience: [
        "experience",
        "work experience",
        "professional experience",
        "employment history",
    ],

    education: [
        "education",
        "academic background",
        "academic qualifications",
    ],

    skills: [
        "skills",
        "technical skills",
        "core skills",
        "core competencies",
        "technologies",
    ],

    projects: [
        "projects",
        "personal projects",
        "academic projects",
        "technical projects",
    ],

    certifications: [
        "certifications",
        "certificates",
        "licenses",
        "licenses & certifications",
    ],

    achievements: [
        "achievements",
        "awards",
        "honors",
        "honours",
        "awards & achievements",
    ],
};

const normalizeLine = (line) => {
    return line
        .trim()
        .toLowerCase()
        .replace(/[:\-–—]+$/, "")
        .trim();
};

const detectSection = (lines, aliases) => {
    return lines.some((line) => {
        const normalizedLine = normalizeLine(line);

        return aliases.includes(normalizedLine);
    });
};

export const analyzeStructure = (text) => {
    if (!text || typeof text !== "string") {
        return {
            detectedSections: [],
            missingSections: [],
        };
    }

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const detectedSections = [];
    const missingSections = [];

    for (const [section, aliases] of Object.entries(
        SECTION_PATTERNS
    )) {
        if (detectSection(lines, aliases)) {
            detectedSections.push(section);
        } else {
            missingSections.push(section);
        }
    }

    return {
        detectedSections,
        missingSections,
    };
};