export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface FoundProfile {
  site: string;
  url: string;
  username: string;
  confidence: number;
  email?: string;
  ip?: string;
}

export interface BreachEntry {
  name: string;
  domain: string | null;
  breachDate: string;
  dataClasses: string[];
  hasPasswordExposure: boolean;
  email?: string;
  ip?: string;
}

export interface ExposureEntry {
  exposed: boolean;
  compromiseDate: string | null;
  stealerFamily: string | null;
  credentialCount: number;
  ip?: string;
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
