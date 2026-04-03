"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    router.push(`/results?username=${encodeURIComponent(username.trim())}`);
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
            Ferramenta visual de análise ética de exposição digital a partir de username,
            com foco em presença pública, indícios de vazamentos e leitura rápida de risco.
          </p>
        </section>

        <section className="card glow-card">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-row">
              <div>
                <label className="label" htmlFor="username">
                  Username alvo
                </label>
                <input
                  id="username"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: marcelosalada"
                />
              </div>

              <button type="submit" className="button button-inline">
                Analisar
              </button>
            </div>
          </form>
        </section>

        <section className="info-grid">
          <div className="info-chip">
            <p className="info-chip-title">Presença pública</p>
            <p className="info-chip-text">
              Localiza perfis públicos associados ao username com leitura inicial de confiança.
            </p>
          </div>

          <div className="info-chip">
            <p className="info-chip-title">Exposição</p>
            <p className="info-chip-text">
              Estrutura preparada para cruzar breaches, infostealer e tipos de dados expostos.
            </p>
          </div>

          <div className="info-chip">
            <p className="info-chip-title">Risk score</p>
            <p className="info-chip-text">
              Classificação rápida em LOW, MEDIUM e HIGH para leitura defensiva.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
