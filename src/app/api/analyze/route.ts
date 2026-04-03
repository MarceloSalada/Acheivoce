import { NextRequest, NextResponse } from "next/server";
import { calculateRiskScore } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  const profiles = [
    { site: "GitHub", url: `https://github.com/${username}`, username, confidence: 90 }
  ];

  const breaches = [];
  const exposure = { exposed: false, compromiseDate: null, stealerFamily: null, credentialCount: 0 };

  const risk = calculateRiskScore({
    breaches,
    profilesCount: profiles.length,
    exposure
  });

  return NextResponse.json({ username, profiles, breaches, exposure, risk });
}
