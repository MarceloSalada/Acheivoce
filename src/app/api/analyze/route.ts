import { NextRequest, NextResponse } from "next/server";
import { calculateRiskScore } from "../../../lib/scoring";
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
  const body = (await req.json()) as RequestBody;

  const parsed = normalizeInput(body);

  if (!parsed.value) {
    return NextResponse.json(
      { error: "Nenhum valor de busca informado." },
      { status: 400 }
    );
  }

  const displayUsername =
    parsed.type === "email"
      ? parsed.value.split("@")[0] || "user"
      : parsed.value;

  const profiles: FoundProfile[] =
    parsed.type === "username"
      ? [
          {
            site: "GitHub",
            url: `https://github.com/${parsed.value}`,
            username: parsed.value,
            confidence: 92,
            email: `${displayUsername}@gmail.com`,
            ip: "192.168.10.25"
          },
          {
            site: "X",
            url: `https://x.com/${parsed.value}`,
            username: parsed.value,
            confidence: 76,
            email: `${displayUsername}@outlook.com`,
            ip: "172.16.20.88"
          },
          {
            site: "Instagram",
            url: `https://instagram.com/${parsed.value}`,
            username: parsed.value,
            confidence: 68
          }
        ]
      : [
          {
            site: "Email Correlation",
            url: "https://example.com/email-correlation",
            username: displayUsername,
            confidence: 81,
            email: parsed.value,
            ip: "192.168.10.25"
          },
          {
            site: "Account Recovery Hint",
            url: "https://example.com/recovery-hint",
            username: displayUsername,
            confidence: 63,
            email: parsed.value
          }
        ];

  const breaches: BreachEntry[] =
    parsed.type === "email"
      ? [
          {
            name: "MailUsers Leak",
            domain: "mailusers.net",
            breachDate: "2024-10-03",
            dataClasses: [
              "Email addresses",
              "IP addresses",
              "Passwords",
              "Usernames"
            ],
            hasPasswordExposure: true,
            email: parsed.value,
            ip: "192.168.10.25"
          },
          {
            name: "RecoveryList Exposure",
            domain: "recoverylist.org",
            breachDate: "2023-05-14",
            dataClasses: [
              "Email addresses",
              "Phone numbers",
              "Usernames"
            ],
            hasPasswordExposure: false,
            email: parsed.value
          }
        ]
      : [
          {
            name: "MockForum Breach",
            domain: "mockforum.com",
            breachDate: "2024-11-18",
            dataClasses: [
              "Email addresses",
              "IP addresses",
              "Usernames",
              "Passwords"
            ],
            hasPasswordExposure: true,
            email: `${displayUsername}@gmail.com`,
            ip: "192.168.10.25"
          },
          {
            name: "ExampleData Leak",
            domain: "exampledata.net",
            breachDate: "2023-07-02",
            dataClasses: [
              "Email addresses",
              "Usernames",
              "Phone numbers"
            ],
            hasPasswordExposure: false,
            email: `${displayUsername}@outlook.com`
          }
        ];

  const exposure: ExposureEntry = {
    exposed: true,
    compromiseDate: "2025-01-11",
    stealerFamily: "RedLine",
    credentialCount: parsed.type === "email" ? 4 : 3,
    ip: "10.0.0.14"
  };

  const risk = calculateRiskScore({
    breaches,
    profilesCount: profiles.length,
    exposure
  });

  return NextResponse.json({
    username: displayUsername,
    queryType: parsed.type,
    rawQuery: parsed.raw,
    normalizedValue: parsed.value,
    profiles,
    breaches,
    exposure,
    risk
  });
}
