"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!username) return;

    router.push(`/results?username=${username}`);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>AcheiVoce</h1>

      <form onSubmit={handleSearch}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite um username"
          style={{ padding: 10, marginRight: 10 }}
        />
        <button type="submit">Analisar</button>
      </form>
    </main>
  );
}
