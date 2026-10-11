"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { Modal } from "@/core/ui/Modal";
import { DIAGRAM_LABEL } from "@/modules/domain/curriculum";
import type { DiagramType } from "@/modules/domain/types";
import { AppShell } from "@/modules/shell/AppShell";
import { useStudy } from "@/modules/study/StudyProvider";
import { ClassDiagramSvg, downloadSvg, SequenceDiagramSvg, UseCaseDiagramSvg } from "./render";

const fmt = (iso: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export const DiagramsPage = observer(function DiagramsPage() {
  const store = useStudy();
  const router = useRouter();
  const p = store.project;
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ type: Exclude<DiagramType, "usecase">; title: string }>({ type: "class", title: "" });
  // "?novo=1" abre a janela de criação (lido depois de montar, sem Suspense).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("novo")) setCreating(true);
  }, []);
  if (!p) {
    return (
      <AppShell crumb="Diagramas">
        <div className="card locked-card">
          <h2>Crie um projeto primeiro</h2>
          <Link className="primary-button large" href="/projetos?novo=1">
            Criar projeto
          </Link>
        </div>
      </AppShell>
    );
  }
  const create = () => {
    const id = store.createDiagram(form.type, form.title || `${DIAGRAM_LABEL[form.type]} — ${p.name}`);
    setCreating(false);
    toast.success("Diagrama criado.");
    router.push(`/diagramas/${id}`);
  };
  return (
    <AppShell crumb="Diagramas">
      <div className="page-head">
        <div>
          <span className="eyebrow">LABORATÓRIO UML</span>
          <h1>Diagramas do projeto</h1>
          <p>Classes e sequência você desenha aqui. O diagrama de casos de uso é gerado automaticamente a partir da etapa 4.</p>
        </div>
        <div className="page-head-actions">
          <button className="primary-button large" onClick={() => setCreating(true)}>
            <Icon name="plus" size={18} /> Novo diagrama
          </button>
        </div>
      </div>

      <div className="diagram-grid">
        <Link href="/diagramas/casos-de-uso" className="diagram-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="diagram-preview">
            <div className="diagram-mini">
              <UseCaseDiagramSvg project={p} />
            </div>
          </div>
          <div className="diagram-info">
            <span className="diagram-icon">
              <Icon name="users" size={18} />
            </span>
            <div>
              <h3>Diagrama de casos de uso</h3>
              <p>Gerado automaticamente · {p.useCases.length} caso(s) de uso</p>
            </div>
          </div>
        </Link>
        {p.diagrams.map((d) => (
          <Link key={d.id} href={`/diagramas/${d.id}`} className="diagram-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="diagram-preview">
              <div className="diagram-mini">{d.type === "class" ? <ClassDiagramSvg diagram={d} /> : <SequenceDiagramSvg diagram={d} />}</div>
            </div>
            <div className="diagram-info">
              <span className="diagram-icon">
                <Icon name="diagram" size={18} />
              </span>
              <div>
                <h3>{d.title}</h3>
                <p>
                  {DIAGRAM_LABEL[d.type]} · editado {fmt(d.updatedAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {creating && (
        <Modal title="Novo diagrama" subtitle="Escolha o tipo. Você poderá renomear depois." onClose={() => setCreating(false)}>
          <div className="template-grid">
            {(["class", "sequence"] as const).map((t) => (
              <button key={t} className={`template-option ${form.type === t ? "on" : ""}`} onClick={() => setForm({ ...form, type: t })}>
                <strong>{DIAGRAM_LABEL[t]}</strong>
                <small>{t === "class" ? "Estrutura: classes, atributos, métodos e relacionamentos." : "Comportamento: mensagens trocadas ao longo do tempo."}</small>
              </button>
            ))}
          </div>
          <label className="field" style={{ marginTop: 14 }}>
            Título
            <input value={form.title} placeholder={`${DIAGRAM_LABEL[form.type]} — ${p.name}`} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <div className="modal-actions">
            <button className="secondary-button" onClick={() => setCreating(false)}>
              Cancelar
            </button>
            <button className="primary-button" onClick={create}>
              Criar diagrama
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
});

export const UseCaseDiagramPage = observer(function UseCaseDiagramPage() {
  const store = useStudy();
  const p = store.project;
  return (
    <AppShell crumb="Diagrama de casos de uso">
      <div className="page-head">
        <div>
          <span className="eyebrow">LABORATÓRIO UML · GERADO AUTOMATICAMENTE</span>
          <h1>Diagrama de casos de uso</h1>
          <p>Cada ator dos seus casos de uso aparece à esquerda, ligado às funcionalidades que usa. Para mudar o desenho, edite os casos de uso da etapa 4.</p>
        </div>
        <div className="page-head-actions">
          <Link className="secondary-button" href="/etapas/4">
            Editar casos de uso
          </Link>
          <button className="primary-button" onClick={() => (downloadSvg("svg-usecase", `casos-de-uso-${p?.name ?? "projeto"}`) ? toast.success("Imagem SVG baixada.") : toast.error("Nada para baixar ainda."))}>
            <Icon name="download" size={16} /> Baixar SVG
          </button>
        </div>
      </div>
      <div className="card canvas-card">
        <div className="canvas">{p && <UseCaseDiagramSvg project={p} id="svg-usecase" />}</div>
      </div>
    </AppShell>
  );
});
