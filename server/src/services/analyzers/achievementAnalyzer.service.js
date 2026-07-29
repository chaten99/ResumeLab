export const analyzeAchievementAndImpact = (text = "", contentMetrics = {}) => {
  const bullets = text
    .split("\n")
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter((l) => l.length > 20);

  const totalBulletsCount = bullets.length || contentMetrics.bulletCount || 10;
  const quantifiedBullets = bullets.filter((b) =>
    /\d+%|\$\d+|\d+\s*(users|clients|ms|seconds|hrs|x|fold|k|m|million|billion|requests|transactions)/i.test(b)
  );

  const actionVerbsRegex = /^(architected|built|designed|engineered|implemented|developed|scaled|reduced|increased|optimized|launched|spearheaded|created|automated|lead|led|managed|migrated|improved|cut)/i;
  const actionVerbBullets = bullets.filter((b) => actionVerbsRegex.test(b));

  const quantifiedCount = Math.max(quantifiedBullets.length, contentMetrics.quantifiedBulletCount || 0);
  const actionVerbsCount = Math.max(actionVerbBullets.length, contentMetrics.actionVerbBulletCount || 0);

  const quantificationRatio = totalBulletsCount > 0 ? Math.round((quantifiedCount / totalBulletsCount) * 100) : 0;
  const actionVerbRatio = totalBulletsCount > 0 ? Math.round((actionVerbsCount / totalBulletsCount) * 100) : 0;

  const quantificationScore = Math.min(100, Math.round(quantificationRatio * 1.3));
  const achievementScore = Math.min(100, Math.round((quantificationRatio * 0.6) + (actionVerbRatio * 0.4)));
  const impactScore = Math.round((quantificationScore + achievementScore) / 2);

  const strongBullets = quantifiedBullets.slice(0, 4);
  const weakBullets = bullets
    .filter((b) => !/\d/.test(b) && /^responsible for|worked on|helped with/i.test(b))
    .slice(0, 4)
    .map((b) => ({
      bullet: b.slice(0, 120),
      issue: "Lacks quantifiable metrics and begins with a weak/passive verb.",
    }));

  const recommendations = [];
  if (quantificationRatio < 50) {
    recommendations.push("Quantify at least 50% of your experience bullet points with revenue, latency, or percentage metrics.");
  }
  if (actionVerbRatio < 70) {
    recommendations.push("Ensure every single bullet point begins with a strong, active verb (e.g., 'Engineered', 'Optimized').");
  }
  if (weakBullets.length > 0) {
    recommendations.push("Replace 'Responsible for' phrasing with direct metric outcomes.");
  }

  return {
    impactScore,
    achievementScore,
    quantificationScore,
    quantifiedBulletsCount: quantifiedCount,
    totalBulletsCount,
    actionVerbsCount,
    responsibilityVsAchievementRatio: Math.max(10, 100 - quantificationRatio),
    strongBullets,
    weakBullets,
    recommendations: recommendations.length > 0 ? recommendations : ["Impact density and metric quantification are excellent."],
  };
};
