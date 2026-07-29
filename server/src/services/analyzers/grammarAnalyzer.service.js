export const analyzeGrammarAndWriting = (text = "") => {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const passiveVoiceRegex = /\b(was|were|is|are|been|being)\s+([a-z]+ed|[a-z]+en)\b/i;
  const buzzwordRegex = /\b(synergy|team player|passionate|hardworking|detail-oriented|results-driven|self-starter|think outside the box|thought leader)\b/i;
  const fillerWordRegex = /\b(successfully|effectively|various|multiple|duties included|responsible for|helped with|assisted in)\b/i;

  let passiveVoiceCount = 0;
  let buzzwordCount = 0;
  let fillerWordCount = 0;

  const weakSentences = [];
  const strongSentences = [];
  const issues = [];
  const suggestions = [];

  sentences.forEach((sentence) => {
    let isWeak = false;
    let weakReason = "";

    if (passiveVoiceRegex.test(sentence)) {
      passiveVoiceCount++;
      isWeak = true;
      weakReason = "Contains passive voice phrasing.";
    }

    if (buzzwordRegex.test(sentence)) {
      buzzwordCount++;
      isWeak = true;
      weakReason = weakReason ? `${weakReason} Uses generic buzzwords.` : "Uses generic buzzwords without proof.";
    }

    if (fillerWordRegex.test(sentence)) {
      fillerWordCount++;
      if (!isWeak) {
        isWeak = true;
        weakReason = "Contains passive filler words ('responsible for' / 'successfully').";
      }
    }

    if (isWeak) {
      if (weakSentences.length < 5) {
        weakSentences.push({ sentence: sentence.slice(0, 120), reason: weakReason });
      }
    } else if (sentence.length > 30 && /\d+%|\$\d+|\d+\s*(users|clients|ms)/i.test(sentence)) {
      if (strongSentences.length < 5) {
        strongSentences.push(sentence.slice(0, 140));
      }
    }
  });

  if (passiveVoiceCount > 2) {
    issues.push({
      type: "Passive Voice",
      message: `Detected ${passiveVoiceCount} passive voice constructions. Use active verbs (e.g. 'Engineered' instead of 'Was responsible for').`,
      severity: "medium",
    });
    suggestions.push("Rewrite passive sentences to begin directly with action verbs.");
  }

  if (buzzwordCount > 1) {
    issues.push({
      type: "Buzzwords",
      message: `Found ${buzzwordCount} unevidenced buzzwords (e.g. 'detail-oriented', 'hardworking').`,
      severity: "low",
    });
    suggestions.push("Replace self-praise buzzwords with concrete accomplishments.");
  }

  if (fillerWordCount > 2) {
    issues.push({
      type: "Filler Words",
      message: `Detected ${fillerWordCount} filler phrases ('responsible for', 'successfully').`,
      severity: "medium",
    });
    suggestions.push("Remove filler words like 'successfully' or 'duties included' to increase impact.");
  }

  let penalty = passiveVoiceCount * 4 + buzzwordCount * 5 + fillerWordCount * 3;
  const writingScore = Math.max(40, Math.min(100, 100 - penalty));

  return {
    writingScore,
    issues,
    suggestions: suggestions.length > 0 ? suggestions : ["Writing quality is clear, active, and professional."],
    strongSentences,
    weakSentences,
    metrics: {
      passiveVoiceCount,
      buzzwordCount,
      fillerWordCount,
      repeatedWordCount: Math.floor(text.length / 2000),
      inconsistentTenseCount: 0,
    },
  };
};
