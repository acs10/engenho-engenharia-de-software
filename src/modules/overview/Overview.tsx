"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { MODELS, modelInfo, STEPS } from "@/modules/domain/curriculum";
import { nextStep, progressPercent } from "@/modules/domain/rules";
import type { DiagramType, ModelId } from "@/modules/domain/types";
import { DiagramPreview } from "@/modules/diagrams/DiagramPreview";
import { AppShell } from "@/modules/shell/AppShell";
import { useStudy } from "@/modules/study/StudyProvider";

const LAB: { title: string; description: string; type: DiagramType }[] = [
  { title: "Diagrama de classes", description: "Modele classes, atributos, métodos e seus relacionamentos.", type: "class" },
  { title: "Diagrama de casos de uso", description: "Visualize atores e as principais funções do sistema.", type: "usecase" },
  { title: "Diagrama de sequência", description: "Entenda a troca de mensagens ao longo do tempo.", type: "sequence" },
];

/** Visão geral: a tela do design, ligada ao projeto atual. */
export const Overview = observer(function Overview() {
  const store = useStudy();
  const router = useRouter();
  const p = store.project;
  const [selected, setSelected] = useState<number | null>(null);

  if (!p) {
    return (
      <AppShell>
        <div className="card locked-card">
          <span>
            <Icon name="folder" size={26} />
          </span>
          <h2>Comece seu primeiro projeto</h2>
          <p>No Engenho você aprende engenharia de software construindo um sistema de verdade, etapa por etapa.</p>
          <Link className="primary-button large" href="/projetos?novo=1">
            <Icon name="plus" size={18} /> Criar projeto
          </Link>
        </div>
      </AppShell>
    );
  }

  const active = selected ?? nextStep(p);
  const pct = progressPercent(p);
  const model = modelInfo(p.model);
  const open = store.canOpen(active);

  const openLab = (type: DiagramType, title: string) => {
    if (type === "usecase") return router.push("/diagramas/casos-de-uso");
    const id = store.createDiagram(type, `${title} — ${p.name}`);
    toast.success(`${title} criado. Mãos à obra!`);
    router.push(`/diagramas/${id}`);
  };

  return (
    <AppShell>
      <section className="hero">
        <div>
          <span className="eyebrow">TRILHA DE APRENDIZAGEM</span>
          <h1>
            Construa software.
            <br />
            <em>Entenda o processo.</em>
          </h1>
          <p>Aprenda engenharia de software na prática, desenvolvendo um projeto completo — da ideia aos diagramas.</p>
        </div>
        <div className="model-card">
          <label htmlFor="model">Modelo de desenvolvimento</label>
          <div className="select-wrap">
            <select
              id="model"
              value={p.model}
              onChange={(e) => {
                store.setModel(e.target.value as ModelId);
                toast(modelInfo(e.target.value as ModelId).summary);
              }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <span className="select-chevron">⌄</span>
          </div>
          <span>
            <Icon name="clock" size={15} /> Estimativa: {model.estimate}
          </span>
        </div>
      </section>

      <section className="progress-panel">
        <div className="progress-head">
          <div>
            <span>SEU PROGRESSO</span>
            <strong>
              {p.completed.length} de 6 etapas concluídas
            </strong>
          </div>
          <b>{pct}%</b>
        </div>
        <div className="progress-track">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="steps">
          {STEPS.map((step, index) => {
            const state = p.completed.includes(index) ? "done" : index === active ? "active" : "next";
            return (
              <button className={`step ${state}`} key={step.title} onClick={() => setSelected(index)}>
                <span className="step-number">{state === "done" ? <Icon name="check" size={16} /> : store.canOpen(index) ? index + 1 : <Icon name="lock" size={13} />}</span>
                <span className="step-copy">
                  <strong>{step.title}</strong>
                  <small>{step.subtitle}</small>
                </span>
                {index === active && (
                  <span className="continue-label">
                    {p.completed.includes(index) ? "REVER" : "CONTINUAR"} <Icon name="chevron" size={15} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="current-step">
        <div className="step-content">
          <span className="eyebrow purple">
            ETAPA {active + 1} DE 6
          </span>
          <h2>{STEPS[active].title}</h2>
          <p>{STEPS[active].intro}</p>
          <div className="lesson-meta">
            <span>
              <Icon name="clock" size={17} /> {STEPS[active].minutes} min
            </span>
            <span>
              <Icon name="file" size={17} /> 3 atividades
            </span>
            {p.completed.includes(active) && (
              <span>
                <Icon name="check" size={17} /> Concluída
              </span>
            )}
          </div>
          {open ? (
            <Link className="primary-button" href={`/etapas/${active + 1}`}>
              <Icon name="play" size={18} /> {p.completed.includes(active) ? "Rever etapa" : p.read.includes(active) ? "Continuar etapa" : "Começar etapa"}
            </Link>
          ) : (
            <button className="primary-button" onClick={() => toast.error(`No ${model.name}, conclua a etapa ${nextStep(p) + 1} primeiro.`)}>
              <Icon name="lock" size={18} /> Etapa bloqueada
            </button>
          )}
        </div>
        <div className="lesson-visual">
          <div className="paper paper-back" />
          <div className="paper">
            <div className="paper-title">
              <span />
              <b>{STEPS[active].paperTitle}</b>
            </div>
            <div className="paper-line long" />
            <div className="paper-line medium" />
            <div className="check-line">
              <span>
                <Icon name="check" size={12} />
              </span>
              <i />
            </div>
            <div className="check-line">
              <span>
                <Icon name="check" size={12} />
              </span>
              <i />
            </div>
            <div className="check-line">
              <span />
              <i />
            </div>
          </div>
          <div className="floating-tag">
            <Icon name="sparkles" size={15} /> {STEPS[active].tag}
          </div>
        </div>
      </section>

      <section className="diagrams-section" id="diagramas">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LABORATÓRIO UML</span>
            <h2>Pratique criando diagramas</h2>
            <p>Use modelos simples e aprenda como cada visão ajuda a descrever seu sistema.</p>
          </div>
          <Link className="secondary-button" href="/diagramas?novo=1">
            <Icon name="plus" size={18} /> Novo diagrama
          </Link>
        </div>
        <div className="diagram-grid">
          {LAB.map((diagram) => (
            <article className="diagram-card" key={diagram.title}>
              <div className="diagram-preview">
                <DiagramPreview type={diagram.type} />
              </div>
              <div className="diagram-info">
                <span className="diagram-icon">
                  <Icon name="diagram" size={18} />
                </span>
                <div>
                  <h3>{diagram.title}</h3>
                  <p>{diagram.description}</p>
                </div>
              </div>
              <button onClick={() => openLab(diagram.type, diagram.title)}>
                {diagram.type === "usecase" ? "Ver diagrama gerado" : "Criar diagrama"} <Icon name="chevron" size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
});
