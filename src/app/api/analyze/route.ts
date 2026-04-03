import { NextRequest, NextResponse } from "next/server";
import { calculateRiskScore } from "../../../lib/scoring";
import { searchBreachesByAccount } from "../../../lib/hibp";
import type {
  BreachEntry,
  ExposureEntry,
  FoundProfile
} from "../../../lib/types";

type RequestBody = {
  query?: string;
  type?: "username" | "email";
  value?: string;
  username?: string;
  email?: string;
};

function normalizeInput(body: RequestBody) {
  const explicitType = body.type;
  const explicitValue = (body.value || "").trim();
  const username = (body.username || "").trim();
  const email = (body.email || "").trim();
  const query = (body.query || "").trim();

  if (explicitType === "email") {
    return {
      type: "email" as const,
      raw: query || email || explicitValue,
      value: (email || explicitValue || query).toLowerCase()
    };
  }

  if (explicitType === "username") {
    const base = username || explicitValue || query;
    const normalized = base.startsWith("@") ? base.slice(1) : base;

    return {
      type: "username" as const,
      raw: query || username || explicitValue,
      value: normalized.toLowerCase()
    };
  }

  const fallback = query || username || explicitValue || email;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fallback);

  if (isEmail) {
    return {
      type: "email" as const,
      raw: fallback,
      value: fallback.toLowerCase()
    };
  }

  const normalized = fallback.startsWith("@") ? fallback.slice(1) : fallback;

  return {
    type: "username" as const,
    raw: fallback,
    value: normalized.toLowerCase()
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const parsed = normalizeInput(body);

    if (!parsed.value) {
      return NextResponse.json(
        { error: "Nenhum valor de busca informado." },
        { status: 400 }
      );
    }

    let profiles: FoundProfile[] = [];
    let breaches: BreachEntry[] = [];
    let exposure: ExposureEntry | null = null;

    if (parsed.type === "email") {
      breaches = await searchBreachesByAccount(parsed.value);

      profiles = [
        {
          site: "Email Correlation",
          url: "https://haveibeenpwned.com/",
          username: parsed.value.split("@")[0] || "user",
          confidence: breaches.length > 0 ? 85 : 60,
          email: parsed.value
        }
      ];
    } else {
      profiles = [
        {
          site: "Username Scan Pending",
          url: `https://example.com/u/${parsed.value}`,
          username: parsed.value,
          confidence: 50
        }
      ];
    }

    const risk = calculateRiskScore({
      breaches,
      profilesCount: profiles.length,
      exposure
    });

    return NextResponse.json({
      username: parsed.type === "email" ? parsed.value.split("@")[0] : parsed.value,
      queryType: parsed.type,
      rawQuery: parsed.raw,
      normalizedValue: parsed.value,
      profiles,
      breaches,
      exposure,
      risk
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado na análise.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
