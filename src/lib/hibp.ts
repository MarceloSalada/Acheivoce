import type { BreachEntry } from "./types";

const HIBP_BASE = "https://haveibeenpwned.com/api/v3";

type HibpBreach = {
  Name: string;
  Domain: string | null;
  BreachDate: string;
  DataClasses: string[];
};

export async function searchBreachesByAccount(account: string): Promise<BreachEntry[]> {
  const apiKey = process.env.HIBP_API_KEY;

  if (!apiKey) {
    throw new Error("HIBP_API_KEY não configurada.");
  }

  const res = await fetch(
    `${HIBP_BASE}/breachedaccount/${encodeURIComponent(account)}?truncateResponse=false`,
    {
      method: "GET",
      headers: {
        "hibp-api-key": apiKey,
        "user-agent": "acheivoce-app"
      },
      cache: "no-store"
    }
  );

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HIBP error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as HibpBreach[];

  return data.map((item) => ({
    name: item.Name,
    domain: item.Domain,
    breachDate: item.BreachDate,
    dataClasses: item.DataClasses,
    hasPasswordExposure: item.DataClasses.includes("Passwords"),
    email: account
  }));
}
