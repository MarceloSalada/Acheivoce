"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function parseInput(value: string) {
  const raw = value.trim();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);

  if (isEmail) {
    return {
      type: "email" as const,
      raw,
      normalized: raw.toLowerCase()
    };
  }

  const normalizedUsername = raw.startsWith("@") ? raw.slice(1) : raw;

  return {
    type: "username" as const,
    raw,
    normalized: normalizedUsername.toLowerCase()
  };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = input.trim();

    if (!value) {
      setError("Digite um username ou email.");
      return;
    }

    const parsed = parseInput(value);

    if (!parsed.normalized) {
      setError("Entrada inválida.");
      return;
    }

    const params = new URLSearchParams();
    params.set("q", parsed.raw);
    params.set("type", parsed.type);
    params.set("value", parsed.normalized);

    router.push(`/results?${params.toString()}`);
  }

  return (
    <main className="page-shell">
      <div className="container">
        <section className="hero">
          <div className="badge-top">OSINT · Ethical · Mobile First</div>

          <h1 className="title">
            Achei<span className="title-accent">Voce</span>
          </h1>

          <p className="subtitle">
            Ferramenta visual de análise ética de exposição digital, preparada para consultar
            username, @username ou email com leitura rápida de risco.
          </p>
        </section>

        <section className="card glow-card">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-row">
              <div>
                <label className="label" htmlFor="query">
                  Username ou email
                </label>

                <input
                  id="query"
                  className="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ex: @marcelosalada ou marcelo@gmail.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              <button type="submit" className="button button-inline">
                Analisar
              </button>
            </div>

            {error && (
              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: "#ff7f96",
                  fontSize: 14
                }}
              >
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="info-grid">
          <div className="info-chip">
            <p className="info-chip-title">Entrada flexível</p>
            <p className="info-chip-text">
              Aceita nickname, @nickname e email sem exigir que você ajuste o formato manualmente.
            </p>
          </div>

          <div className="info-chip">
            <p className="info-chip-title">Normalização</p>
            <p className="info-chip-text">
              O sistema identifica automaticamente se a busca é por username ou por email.
            </p>
          </div>

          <div className="info-chip">
            <p className="info-chip-title">Sanitização visual</p>
            <p className="info-chip-text">
              Os dados continuam úteis para análise, mas aparecem obscurecidos na interface.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
