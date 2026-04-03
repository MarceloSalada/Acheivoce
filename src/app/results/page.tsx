"use client";

import { useEffect, useState } from "react";

type AnalysisResult = {
  username: string;
  profiles: { site: string; url: string; username: string; confidence: number }[];
  breaches: { name: string; domain: string | null; breachDate: string; dataClasses: string[]; hasPasswordExposure: boolean }[];
  exposure: { exposed: boolean; compromiseDate: string | null; stealerFamily: string | null; credentialCount: number } | null;
  risk: { score: number; level: "LOW" | "MEDIUM" | "HIGH"; reasons: string[] };
};

export default function ResultsPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (!username) {
      setError("Sem username informado.");
      setLoading(false);
      return;
    }

    fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Falha na análise");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err.message || "Erro inesperado");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Resultado da análise</h1>

      {loading && <p>Carregando...</p>}
      {error && <p>{error}</p>}

      {data && (
        <>
          <p><strong>Username:</strong> {data.username}</p>
          <p><strong>Score:</strong> {data.risk.score}</p>
          <p><strong>Nível:</strong> {data.risk.level}</p>

          <h2>Perfis encontrados</h2>
          {data.profiles.length === 0 ? (
            <p>Nenhum perfil encontrado.</p>
          ) : (
            <ul>
              {data.profiles.map((profile) => (
                <li key={`${profile.site}-${profile.url}`}>
                  <strong>{profile.site}</strong> — {profile.url} — confiança {profile.confidence}%
                </li>
              ))}
            </ul>
          )}

          <h2>Breaches</h2>
          {data.breaches.length === 0 ? (
            <p>Nenhuma brecha retornada.</p>
          ) : (
            <ul>
              {data.breaches.map((breach) => (
                <li key={`${breach.name}-${breach.breachDate}`}>
                  {breach.name} — {breach.breachDate}
                </li>
              ))}
            </ul>
          )}

          <h2>Infostealer exposure</h2>
          {!data.exposure ? (
            <p>Sem dados de exposição.</p>
          ) : (
            <ul>
              <li>Status: {String(data.exposure.exposed)}</li>
              <li>Data: {data.exposure.compromiseDate ?? "N/A"}</li>
              <li>Família: {data.exposure.stealerFamily ?? "N/A"}</li>
              <li>Credenciais: {data.exposure.credentialCount}</li>
            </ul>
          )}
        </>
      )}
    </main>
  );
}
