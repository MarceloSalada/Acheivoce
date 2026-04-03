export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface FoundProfile {
  site: string;
  url: string;
  username: string;
  confidence: number;
}

export interface BreachEntry {
  name: string;
  domain: string | null;
  breachDate: string;
  dataClasses: string[];
  hasPasswordExposure: boolean;
}

export interface ExposureEntry {
  exposed: boolean;
  compromiseDate: string | null;
  stealerFamily: string | null;
  credentialCount: number;
}

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  reasons: string[];
}

export interface AnalysisResult {
  username: string;
  profiles: FoundProfile[];
  breaches: BreachEntry[];
  exposure: ExposureEntry | null;
  risk: RiskScoreResult;
}
