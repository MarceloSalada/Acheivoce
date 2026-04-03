async function analyze(username: string) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  return res.json();
}

export default async function Results({ searchParams }: any) {
  const username = searchParams.username;

  if (!username) return <div>Sem username</div>;

  const data = await analyze(username);

  return (
    <main style={{ padding: 20 }}>
      <h1>Resultado</h1>
      <p>Usuário: {data.username}</p>
      <p>Score: {data.risk.score}</p>
      <p>Nível: {data.risk.level}</p>
    </main>
  );
}
