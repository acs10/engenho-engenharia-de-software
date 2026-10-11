import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <p className="eyebrow">ERRO 404</p>
        <h1>Página não encontrada</h1>
        <p style={{ color: "var(--muted)", margin: "16px 0 24px" }}>Esse endereço não existe no Engenho.</p>
        <Link className="primary-button" href="/">
          Voltar à visão geral
        </Link>
      </div>
    </div>
  );
}
