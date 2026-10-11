"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { observer } from "@/core/state/mobx";
import { Icon, type IconName } from "@/core/ui/Icon";
import { modelInfo, STEPS } from "@/modules/domain/curriculum";
import { nextStep } from "@/modules/domain/rules";
import { useStudy } from "@/modules/study/StudyProvider";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Visão geral", icon: "home" },
  { href: "/projetos", label: "Meus projetos", icon: "folder" },
  { href: "/diagramas", label: "Diagramas", icon: "diagram" },
  { href: "/biblioteca", label: "Biblioteca", icon: "book" },
];

const TIPS = [
  "Não tenha pressa. O importante é entender o porquê de cada etapa.",
  "Um requisito que não pode ser testado ainda não é um requisito.",
  "Comece o diagrama de classes pelos substantivos dos casos de uso.",
  "Toda história precisa de um “para quê”. Sem valor, não há prioridade.",
  "Pós-condições bem escritas viram testes automatizados.",
];

/** Esqueleto do design: barra lateral escura + topo com trilha de navegação. */
export const AppShell = observer(function AppShell({ crumb, children, actions }: { crumb?: string; children: ReactNode; actions?: ReactNode }) {
  const store = useStudy();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const p = store.project;
  const [tip, setTip] = useState(0);
  useEffect(() => setMenu(false), [pathname]);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const step = p ? nextStep(p) : 0;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Icon name="layers" size={22} />
          </div>
          <span>Engenho</span>
          <button className="sidebar-close" onClick={() => setMenu(false)} aria-label="Fechar menu">
            ×
          </button>
        </div>

        <nav className="primary-nav" aria-label="Navegação principal">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`nav-item ${active(n.href) ? "active" : ""}`} aria-current={active(n.href) ? "page" : undefined}>
              <Icon name={n.icon} /> {n.label}
            </Link>
          ))}
        </nav>

        {p && (
          <div className="sidebar-section">
            <span className="section-label">PROJETO ATUAL</span>
            <Link href={`/etapas/${step + 1}`} className="project-row">
              <span className="project-icon">
                <Icon name="file" size={17} />
              </span>
              <span>
                <strong>{p.name}</strong>
                <small>{p.completed.length === 6 ? "Concluído" : `Em andamento · ${STEPS[step].title}`}</small>
              </span>
              <Icon name="chevron" size={16} />
            </Link>
            <span className="sidebar-model">{modelInfo(p.model).name}</span>
          </div>
        )}

        <div className="sidebar-bottom">
          <button className="tip-card" onClick={() => setTip((tip + 1) % TIPS.length)} title="Próxima dica">
            <span className="tip-icon">
              <Icon name="sparkles" size={18} />
            </span>
            <strong>Dica de estudo</strong>
            <p>{TIPS[tip]}</p>
          </button>
          <Link href="/ajuda" className={`nav-item ${active("/ajuda") ? "active" : ""}`}>
            <Icon name="help" /> Ajuda e recursos
          </Link>
          <Link href="/configuracoes" className={`nav-item ${active("/configuracoes") ? "active" : ""}`}>
            <Icon name="settings" /> Configurações
          </Link>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenu(true)} aria-label="Abrir menu">
            <Icon name="layers" />
          </button>
          <div className="breadcrumb">
            <Link href="/projetos">
              <span>Meus projetos</span>
            </Link>
            <b>/</b>
            {crumb ? (
              <>
                <Link href="/">
                  <span>{p?.name ?? "—"}</span>
                </Link>
                <b>/</b>
                <strong>{crumb}</strong>
              </>
            ) : (
              <strong>{p?.name ?? "Nenhum projeto"}</strong>
            )}
          </div>
          <div className="topbar-actions">{actions}</div>
        </header>
        <div className="content">{children}</div>
      </main>

      {menu && <button className="overlay" onClick={() => setMenu(false)} aria-label="Fechar menu" />}
    </div>
  );
});
