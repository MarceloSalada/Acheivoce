import { BreachEntry, ExposureEntry, RiskScoreResult } from "./types";

export function calculateRiskScore(params: {
  breaches: BreachEntry[];
  profilesCount: number;
  exposure: ExposureEntry | null;
}): RiskScoreResult {
  const { breaches, profilesCount, exposure } = params;

  let score = 0;
  const reasons: string[] = [];

  if (breaches.length > 0) {
    score += Math.min(40, breaches.length * 10);
    reasons.push(`Encontradas ${breaches.length} brechas.`);
  }

  if (breaches.some((b) => b.hasPasswordExposure)) {
    score += 25;
    reasons.push("Possível exposição de senha.");
  }

  if (exposure?.exposed) {
    score += 25;
    reasons.push("Indício de infostealer.");
  }

  if (profilesCount >= 5) {
    score += 10;
  }

  let level: RiskScoreResult["level"] = "LOW";
  if (score >= 70) level = "HIGH";
  else if (score >= 35) level = "MEDIUM";

  return { score, level, reasons };
}
