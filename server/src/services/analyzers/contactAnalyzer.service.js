const EMAIL_PATTERN =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const PHONE_PATTERN =
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4,6}\b/;

const LINKEDIN_PATTERN =
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s]+/i;

const GITHUB_PATTERN =
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s]+/i;

const URL_PATTERN =
    /https?:\/\/(?:www\.)?[^\s]+/gi;

const cleanUrl = (url) => {
    return url.replace(/[),.;]+$/, "");
};

export const analyzeContact = (text) => {
    if (!text || typeof text !== "string") {
        return {
            email: null,
            phone: null,
            linkedin: null,
            github: null,
            portfolio: null,
        };
    }

    const email = text.match(EMAIL_PATTERN)?.[0] ?? null;
    const phone = text.match(PHONE_PATTERN)?.[0] ?? null;
    const linkedin = text.match(LINKEDIN_PATTERN)?.[0] ?? null;
    const github = text.match(GITHUB_PATTERN)?.[0] ?? null;

    const urls = (text.match(URL_PATTERN) ?? []).map(cleanUrl);

    const portfolio =
        urls.find(
            (url) =>
                !url.toLowerCase().includes("linkedin.com") &&
                !url.toLowerCase().includes("github.com")
        ) ?? null;

    return {
        email,
        phone,
        linkedin,
        github,
        portfolio,
    };
};