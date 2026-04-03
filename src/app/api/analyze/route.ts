import { NextRequest, NextResponse } from "next/server";
import { calculateRiskScore } from "../../../lib/scoring";
import type { BreachEntry, ExposureEntry, FoundProfile } from "../../../lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const username = String(body?.username || "").trim();

  if (!username) {
    return NextResponse.json(
      { error: "Username é obrigatório." },
      { status: 400 }
    );
  }

  const profiles: FoundProfile[] = [
    {
      site: "GitHub",
      url: `https://github.com/${username}`,
      username,
      confidence: 92,
      email: `${username}@gmail.com`,
      ip: "192.168.10.25"
    },
    {
      site: "X",
      url: `https://x.com/${username}`,
      username,
      confidence: 76,
      email: `${username}@outlook.com`,
      ip: "172.16.20.88"
    },
    {
      site: "Instagram",
      url: `https://instagram.com/${username}`,
      username,
      confidence: 68
    }
  ];

  const breaches: BreachEntry[] = [
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
      email: `${username}@gmail.com`,
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
      email: `${username}@outlook.com`
    }
  ];

  const exposure: ExposureEntry = {
    exposed: true,
    compromiseDate: "2025-01-11",
    stealerFamily: "RedLine",
    credentialCount: 3,
    ip: "10.0.0.14"
  };

  const risk = calculateRiskScore({
    breaches,
    profilesCount: profiles.length,
    exposure
  });

  return NextResponse.json({
    username,
    profiles,
    breaches,
    exposure,
    risk
  });
}
