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
    reasons.push(`Foram encontradas ${breaches.length} ocorrências de brechas.`);
  }

  if (breaches.some((b) => b.hasPasswordExposure)) {
    score += 25;
    reasons.push("Há indício de exposição de senha em ao menos uma brecha.");
  }

  if (profilesCount >= 3) {
    score += 10;
    reasons.push("Há presença pública em múltiplos serviços.");
  }

  if (exposure?.exposed) {
    score += 25;
    reasons.push("Há indício de comprometimento por infostealer.");
  }

  score = Math.min(score, 100);

  let level: RiskScoreResult["level"] = "LOW";
  if (score >= 70) level = "HIGH";
  else if (score >= 35) level = "MEDIUM";

  return { score, level, reasons };
}
