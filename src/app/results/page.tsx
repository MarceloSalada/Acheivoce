"use client";

import { useEffect, useMemo, useState } from "react";

type AnalysisResult = {
  username: string;
  profiles: {
    site: string;
    url: string;
    username: string;
    confidence: number;
  }[];
  breaches: {
    name: string;
    domain: string | null;
    breachDate: string;
    dataClasses: string[];
    hasPasswordExposure: boolean;
  }[];
  exposure: {
    exposed: boolean;
    compromiseDate: string | null;
    stealerFamily: string | null;
    credentialCount: number;
  } | null;
  risk: {
    score: number;
    level: "LOW" | "MEDIUM" | "HIGH";
    reasons: string[];
  };
};

export default function ResultsPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const username = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("username") || "";
  }, []);

  useEffect(() => {
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
        if (!res.ok) throw new Error("Falha na análise.");
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err.message || "Erro inesperado.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const riskClass =
    data?.risk.level === "HIGH"
      ? "risk-badge risk-high"
      : data?.risk.level === "MEDIUM"
      ? "risk-badge risk-medium"
      : "risk-badge risk-low";

  return (
    <main className="page-shell">
      <div className="container">
        <section className="hero">
          <div className="badge-top">Scan Result</div>
          <h1 className="title">
            Resultado<span className="title-accent">Analítico</span>
          </h1>
          <p className="subtitle">
            Leitura inicial de presença digital e risco para o username consultado.
          </p>
        </section>

        {loading && (
          <section className="card">
            <p className="loading">Carregando análise...</p>
          </section>
        )}

        {error && (
          <section className="card">
            <p className="error">{error}</p>
            <a className="back-link" href="/">
              ← Voltar
            </a>
          </section>
        )}

        {data && (
          <>
            <section className="card">
              <div className="results-header">
                <div>
                  <p className="label">Username consultado</p>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>
                    {data.username}
                  </h2>
                </div>

                <div className="risk-box">
                  <div>
                    <p className="label">Risk score</p>
                    <div className="risk-score">{data.risk.score}/100</div>
                  </div>

                  <div className={riskClass}>{data.risk.level}</div>
                </div>
              </div>

              {data.risk.reasons.length > 0 && (
                <ul className="reasons">
                  {data.risk.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h3 className="section-title">Perfis encontrados</h3>

              {data.profiles.length === 0 ? (
                <p className="empty">Nenhum perfil encontrado.</p>
              ) : (
                <div className="list">
                  {data.profiles.map((profile) => (
                    <div className="item" key={`${profile.site}-${profile.url}`}>
                      <p className="item-title">{profile.site}</p>
                      <a href={profile.url} target="_blank" rel="noreferrer">
                        {profile.url}
                      </a>
                      <p className="item-meta">Confiança: {profile.confidence}%</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h3 className="section-title">Breaches</h3>

              {data.breaches.length === 0 ? (
                <p className="empty">Nenhuma brecha retornada neste mock inicial.</p>
              ) : (
                <div className="list">
                  {data.breaches.map((breach) => (
                    <div className="item" key={`${breach.name}-${breach.breachDate}`}>
                      <p className="item-title">{breach.name}</p>
                      <p className="item-meta">Domínio: {breach.domain ?? "N/A"}</p>
                      <p className="item-meta">Data: {breach.breachDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h3 className="section-title">Infostealer Exposure</h3>

              {!data.exposure ? (
                <p className="empty">Sem dados de exposição.</p>
              ) : (
                <div className="list">
                  <div className="item">
                    <p className="item-meta">Status: {String(data.exposure.exposed)}</p>
                    <p className="item-meta">
                      Data do comprometimento: {data.exposure.compromiseDate ?? "N/A"}
                    </p>
                    <p className="item-meta">
                      Família do stealer: {data.exposure.stealerFamily ?? "N/A"}
                    </p>
                    <p className="item-meta">
                      Quantidade de credenciais: {data.exposure.credentialCount}
                    </p>
                  </div>
                </div>
              )}
            </section>

            <a className="back-link" href="/">
              ← Nova consulta
            </a>
          </>
        )}
      </div>
    </main>
  );
}
