import { sanitizeExtractedText, isArtifactOrPageMarker } from "../../utils/textSanitizer.js";

export const analyzeProjectSections = (text = "", aiProjectFeedback = [], structuredResume = null) => {
  const items = [];

  const rawProjects = structuredResume?.projects && structuredResume.projects.length > 0
    ? structuredResume.projects
    : [];

  if (rawProjects.length > 0) {
    rawProjects.forEach((proj, idx) => {
      let title = (proj.title || "").trim().replace(/^[-•*|]\s*/, "").replace(/\s*\|\s*.*/, "").slice(0, 50);
      if (!title || isArtifactOrPageMarker(title)) {
        title = `Project #${idx + 1}`;
      }

      const combinedText = `${proj.title} ${proj.description} ${(proj.techStack || []).join(" ")} ${(proj.bullets || []).join(" ")}`;

      const highlights = [];
      if (/websocket|socket\.io|real-time|realtime|sse/i.test(combinedText)) {
        highlights.push("✓ Real-time Communication & WebSockets");
      }
      if (/redis|cache|caching/i.test(combinedText)) {
        highlights.push("✓ Redis Caching & In-Memory Storage");
      }
      if (/jwt|auth|oauth|passport|session|cookie/i.test(combinedText)) {
        highlights.push("✓ Token Authentication & Access Control");
      }
      if (/docker|container|kubernetes|aws|cloud|vercel|render/i.test(combinedText)) {
        highlights.push("✓ Cloud Deployment & Containerization");
      }
      if (/stripe|payment|paypal|checkout/i.test(combinedText)) {
        highlights.push("✓ Payment Integration & Transaction Workflows");
      }
      if (/rest|api|graphql|endpoint/i.test(combinedText)) {
        highlights.push("✓ REST API / Interface Architecture");
      }
      if (/mongo|postgres|sql|database|schema|orm/i.test(combinedText)) {
        highlights.push("✓ Database Schema & Query Optimization");
      }

      if (highlights.length === 0) {
        highlights.push("✓ Modular Application Architecture");
        highlights.push("✓ Frontend Component State Management");
      }

      const missing = [];
      const hasLink = (proj.links && proj.links.length > 0) || /https?:\/\/|github\.com|vercel\.app|render\.com/i.test(combinedText);
      if (!hasLink) {
        missing.push("No live deployment URL or public GitHub repository link");
      }
      if (!/\d+%|\$\d+|\d+\s*(users|clients|ms|requests|throughput)/i.test(combinedText)) {
        missing.push("No measurable performance or scale metrics (e.g. latency, concurrent users)");
      }
      if (!/jest|cypress|mocha|unit test|testing/i.test(combinedText)) {
        missing.push("No automated testing framework or test coverage mentioned");
      }
      if (!/ci\/cd|github actions|pipeline|docker/i.test(combinedText)) {
        missing.push("No CI/CD pipeline or automated deployment strategy described");
      }

      const concerns = [];
      if (!/\d+%|\$\d+|\d+/.test(combinedText)) {
        concerns.push("Project appears technically sound but provides no evidence of scale or measurable business impact.");
      }
      if (!hasLink) {
        concerns.push("Lacks live verification links, forcing recruiters to rely on unverified claims.");
      }

      const suggestions = [
        "Include a live deployment link and open-source GitHub repository URL.",
        "Add measurable outcomes (e.g., 'Reduced API query latency by 35% through Redis caching').",
        "Describe specific engineering challenges solved during implementation.",
      ];

      const fb = aiProjectFeedback[idx];
      const isHighDifficulty = highlights.length >= 3;
      const isMediumDifficulty = highlights.length >= 2;

      const diffLevel = isHighDifficulty ? "High" : isMediumDifficulty ? "Medium" : "Standard";
      const diffReasoning = isHighDifficulty
        ? "Incorporates multiple complex technical patterns including caching, real-time sync, or authentication."
        : isMediumDifficulty
        ? "Includes multi-tier API development, database interaction, and client-server state handling."
        : "Standard web application structure demonstrating foundational framework proficiency.";

      const valueLevel =
        highlights.length >= 3 && missing.length <= 1
          ? "Excellent Resume Project"
          : highlights.length >= 2
          ? "Strong Resume Project"
          : highlights.length >= 1
          ? "Average Resume Project"
          : "Weak Resume Project";

      const valueReasoning =
        valueLevel === "Excellent Resume Project"
          ? "Exhibits advanced technical depth, production deployment practices, and high relevance to hiring standards."
          : valueLevel === "Strong Resume Project"
          ? "Demonstrates practical technical competency and solid application engineering fundamentals."
          : "Standard portfolio entry; requires live links and quantified performance figures to differentiate from other candidates.";

      const recruiterImpression = fb
        ? fb.description
        : `This project signals practical competency in ${highlights
            .map((h) => h.replace(/^✓\s*/, ""))
            .join(", ")}. It establishes evidence of hands-on application development for target engineering roles.`;

      const projectScore =
        valueLevel === "Excellent Resume Project"
          ? 90
          : valueLevel === "Strong Resume Project"
          ? 82
          : valueLevel === "Average Resume Project"
          ? 72
          : 62;

      items.push({
        projectName: title,
        projectScore,
        recruiterImpression,
        resumeValue: {
          level: valueLevel,
          reasoning: valueReasoning,
        },
        technicalHighlights: highlights,
        missingOpportunities: missing,
        recruiterConcerns: concerns.length > 0 ? concerns : ["No critical red flag concerns detected."],
        aiImprovementSuggestions: suggestions,
        technicalDifficulty: {
          level: diffLevel,
          reasoning: diffReasoning,
        },
      });
    });
  }

  if (items.length === 0) {
    const cleanText = sanitizeExtractedText(text);

    let projSectionText = "";

    const sectionStartMatch = cleanText.match(
      /(?:^|\n)\s*(?:PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS|KEY PROJECTS|FEATURED PROJECTS|TECHNICAL PROJECTS|PORTFOLIO PROJECTS)\b([\s\S]*)/i
    );

    if (sectionStartMatch && sectionStartMatch[1]) {
      const rawContent = sectionStartMatch[1];
      const terminatorMatch = rawContent.match(
        /(?:^|\n)\s*(?:EDUCATION|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|ACHIEVEMENTS|PUBLICATIONS|SUMMARY|CONTACT|LANGUAGES|VOLUNTEER|DECLARATION)\b/i
      );

      if (terminatorMatch && terminatorMatch.index !== undefined) {
        projSectionText = rawContent.slice(0, terminatorMatch.index).trim();
      } else {
        projSectionText = rawContent.trim();
      }
    }

    const rawBlocks = projSectionText
      ? projSectionText
          .split(/\n(?=[A-Z0-9\s\-_–|]{3,40}(?:\s*\||\s*[-–]|\s*\n|\s*:))/i)
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    rawBlocks.forEach((block, idx) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => Boolean(l) && !isArtifactOrPageMarker(l));

      if (lines.length === 0) return;

      let candidateTitle = lines[0]
        .replace(/^[-•*|]\s*/, "")
        .replace(/\s+[-–]\s+.*/, "")
        .replace(/\s*\|\s*.*/, "")
        .trim();

      if (isArtifactOrPageMarker(candidateTitle)) return;

      items.push({
        projectName: candidateTitle.slice(0, 50),
        projectScore: 80,
        recruiterImpression: "Solid portfolio project demonstrating functional engineering capabilities.",
        resumeValue: {
          level: "Strong Resume Project",
          reasoning: "Demonstrates application implementation relevant to engineering roles.",
        },
        technicalHighlights: ["✓ Application Architecture", "✓ State & API Integration"],
        missingOpportunities: ["No live deployment URL link"],
        recruiterConcerns: ["Add performance benchmarks and live demo URL."],
        aiImprovementSuggestions: ["Add live deployment link and quantified metrics."],
        technicalDifficulty: {
          level: "Medium",
          reasoning: "Includes standard multi-tier software implementation.",
        },
      });
    });
  }

  if (items.length === 0) {
    items.push({
      projectName: "Core Portfolio Web Platform",
      projectScore: 82,
      recruiterImpression:
        "This project demonstrates solid full-stack engineering fundamentals, practical access control knowledge, and real-world database design. It signals reliable feature implementation capabilities for full-stack and backend roles.",
      resumeValue: {
        level: "Strong Resume Project",
        reasoning:
          "Demonstrates multi-tier architecture, session state persistence, and API routing relevant to target role expectations.",
      },
      technicalHighlights: [
        "✓ REST API Architecture",
        "✓ Token Authentication & Authorization",
        "✓ Relational / NoSQL Database Persistence",
        "✓ State Management & Component Separation",
      ],
      missingOpportunities: [
        "No live production demo link (e.g. Vercel/Render)",
        "No GitHub repository URL provided for direct code inspection",
        "No measurable performance metrics (e.g. latency, throughput, user volume)",
        "No explicit unit/integration test suite mentioned",
      ],
      recruiterConcerns: [
        "Project demonstrates core implementation skills but lacks evidence of production load testing or scalability benchmarks.",
        "Without a live URL or repository link, recruiters cannot verify code quality or UI polish directly.",
      ],
      aiImprovementSuggestions: [
        "Add a live deployment URL (e.g., https://app.domain.com) and a public GitHub link.",
        "Quantify project impact (e.g., 'Handled 500+ daily API requests with sub-100ms response times').",
        "Highlight architectural decisions such as database indexing, caching strategies, or CI/CD pipelines.",
      ],
      technicalDifficulty: {
        level: "Medium",
        reasoning:
          "Combines multi-tier API endpoints, user access control, and database persistence into an integrated application.",
      },
    });
  }

  const overallScore = Math.round(
    items.reduce((acc, curr) => acc + curr.projectScore, 0) / (items.length || 1)
  );

  return {
    overallProjectScore: overallScore,
    items,
  };
};
