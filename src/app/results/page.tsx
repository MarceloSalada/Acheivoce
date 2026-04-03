"use client";

import { useEffect, useMemo, useState } from "react";
import Redacted from "../../components/Redacted";
import { maskEmail, maskIP, maskMiddle } from "../../lib/sanitize";

type QueryType = "username" | "email";

type AnalysisResult = {
  username: string;
  profiles: {
    site: string;
    url: string;
    username: string;
    confidence: number;
    email?: string;
    ip?: string;
  }[];
  breaches: {
    name: string;
    domain: string | null;
    breachDate: string;
    dataClasses: string[];
    hasPasswordExposure: boolean;
    email?: string;
    ip?: string;
  }[];
  exposure: {
    exposed: boolean;
    compromiseDate: string | null;
    stealerFamily: string | null;
    credentialCount: number;
    ip?: string;
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

  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        rawQuery: "",
        type: "username" as QueryType,
        value: ""
      };
    }

    const search = new URLSearchParams(window.location.search);

    const rawQuery = search.get("q") || "";
    const type = (search.get("type") as QueryType) || "username";
    const value = search.get("value") || "";

    return {
      rawQuery,
      type: type === "email" ? "email" : "username",
      value
    };
  }, []);

  useEffect(() => {
    if (!params.value) {
      setError("Nenhum valor de busca informado.");
      setLoading(false);
      return;
    }

    fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: params.rawQuery,
        type: params.type,
        value: params.value,
        username: params.type === "username" ? params.value : undefined,
        email: params.type === "email" ? params.value : undefined
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Falha na análise.");
        }
        return res.json();
      })
      .then((json: AnalysisResult) => {
        setData(json);
      })
      .catch((err: Error) => {
        setError(err.message || "Erro inesperado.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params]);

  const riskClass =
    data?.risk.level === "HIGH"
      ? "risk-badge risk-high"
      : data?.risk.level === "MEDIUM"
      ? "risk-badge risk-medium"
      : "risk-badge risk-low";

  const displayQuery =
    params.type === "email"
      ? params.value
      : params.rawQuery.startsWith("@")
      ? params.rawQuery
      : `@${params.value}`;

  return (
    <main className="page-shell">
      <div className="container">
        <section className="hero">
          <div className="badge-top">Scan Result</div>
          <h1 className="title">
            Resultado<span className="title-accent">Analítico</span>
          </h1>
          <p className="subtitle">
            Leitura ética de presença digital, exposição e risco para a entrada consultada.
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
                  <p className="label">Entrada consultada</p>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>
                    {params.type === "email" ? (
                      <Redacted text={maskEmail(displayQuery)} />
                    ) : (
                      <Redacted text={maskMiddle(displayQuery)} />
                    )}
                  </h2>

                  <p className="item-meta" style={{ marginTop: 8 }}>
                    Tipo detectado: {params.type === "email" ? "Email" : "Username"}
                  </p>

                  <p className="item-meta">
                    Valor normalizado:{" "}
                    {params.type === "email" ? (
                      <Redacted text={maskEmail(params.value)} />
                    ) : (
                      <Redacted text={maskMiddle(params.value)} />
                    )}
                  </p>
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

                      <p className="item-meta">
                        URL pública:{" "}
                        <a href={profile.url} target="_blank" rel="noreferrer">
                          {profile.url}
                        </a>
                      </p>

                      <p className="item-meta">
                        Username: <Redacted text={maskMiddle(profile.username)} />
                      </p>

                      {profile.email && (
                        <p className="item-meta">
                          Email: <Redacted text={maskEmail(profile.email)} />
                        </p>
                      )}

                      {profile.ip && (
                        <p className="item-meta">
                          IP: <Redacted text={maskIP(profile.ip)} />
                        </p>
                      )}

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

                      {breach.email && (
                        <p className="item-meta">
                          Email associado: <Redacted text={maskEmail(breach.email)} />
                        </p>
                      )}

                      {breach.ip && (
                        <p className="item-meta">
                          IP associado: <Redacted text={maskIP(breach.ip)} />
                        </p>
                      )}

                      <div className="item-meta" style={{ marginTop: 10 }}>
                        Dados expostos:
                      </div>

                      {breach.dataClasses.length === 0 ? (
                        <p className="item-meta">Nenhum tipo informado.</p>
                      ) : (
                        <ul className="reasons">
                          {breach.dataClasses.map((item) => (
                            <li key={item}>
                              <Redacted text={maskMiddle(item, 3)} />
                            </li>
                          ))}
                        </ul>
                      )}

                      <p className="item-meta">
                        Senha exposta: {breach.hasPasswordExposure ? "Sim" : "Não"}
                      </p>
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
                      Família do stealer:{" "}
                      {data.exposure.stealerFamily ? (
                        <Redacted text={maskMiddle(data.exposure.stealerFamily)} />
                      ) : (
                        "N/A"
                      )}
                    </p>
                    <p className="item-meta">
                      Quantidade de credenciais: {data.exposure.credentialCount}
                    </p>

                    {data.exposure.ip && (
                      <p className="item-meta">
                        IP relacionado: <Redacted text={maskIP(data.exposure.ip)} />
                      </p>
                    )}
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
