"use client";

import Link from "next/link";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { ListEditor } from "@/core/ui/ListEditor";
import { useCaseIssues } from "@/modules/domain/rules";
import { UseCaseDiagramSvg } from "@/modules/diagrams/render";
import { useStudy } from "@/modules/study/StudyProvider";

/** Etapa 4 — especificação de casos de uso (e o diagrama gerado a partir deles). */
export const UseCasesEditor = observer(function UseCasesEditor() {
  const store = useStudy();
  const p = store.project!;
  return (
    <div>
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Especificação dos casos de uso</h3>
            <p>Um caso de uso por objetivo do ator. Nome com verbo: “Registrar empréstimo”, “Renovar livro”.</p>
          </div>
          <span className="badge badge-purple">{p.useCases.length} casos de uso</span>
        </div>

        {p.useCases.map((u) => {
          const issues = useCaseIssues(u);
          return (
            <div className="uc-card" key={u.id}>
              <div className="card-row-head">
                <strong>
                  <span className="code-badge">{u.code}</span> {u.name || "Novo caso de uso"}
                </strong>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {issues.length ? <span className="badge badge-amber">{issues.length} pendência(s)</span> : <span className="badge badge-green">✓ Completo</span>}
                  <button className="icon-btn danger" onClick={() => store.removeUseCase(u.id)} aria-label={`Remover ${u.code}`}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
              <div className="uc-grid">
                <label className="field">
                  Código
                  <input value={u.code} disabled aria-label={`Código ${u.code}`} />
                </label>
                <label className="field">
                  Nome
                  <input aria-label={`Nome ${u.code}`} value={u.name} placeholder="Registrar empréstimo" onChange={(e) => store.updateUseCase(u.id, { name: e.target.value })} />
                </label>
                <label className="field">
                  Ator principal
                  <input aria-label={`Ator ${u.code}`} list="atores" value={u.actor} placeholder="Bibliotecária" onChange={(e) => store.updateUseCase(u.id, { actor: e.target.value })} />
                </label>
              </div>
              <label className="field" style={{ marginTop: 12 }}>
                Pré-condições
                <input aria-label={`Pré-condições ${u.code}`} value={u.preconditions} placeholder="O aluno está cadastrado e sem multas" onChange={(e) => store.updateUseCase(u.id, { preconditions: e.target.value })} />
              </label>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="field">
                  Fluxo principal
                  <ListEditor numbered label={`Passo de ${u.code}`} items={u.mainFlow} placeholder="O ator… / O sistema…" addLabel="Adicionar passo" onChange={(i, v) => store.setFlowStep(u.id, "mainFlow", i, v)} onAdd={() => store.addFlowStep(u.id, "mainFlow")} onRemove={(i) => store.removeFlowStep(u.id, "mainFlow", i)} />
                </div>
                <div className="field">
                  Fluxos alternativos / exceções
                  <ListEditor label={`Alternativo de ${u.code}`} items={u.alternativeFlows} placeholder="2a. Livro indisponível: o sistema oferece reserva" addLabel="Adicionar fluxo alternativo" onChange={(i, v) => store.setFlowStep(u.id, "alternativeFlows", i, v)} onAdd={() => store.addFlowStep(u.id, "alternativeFlows")} onRemove={(i) => store.removeFlowStep(u.id, "alternativeFlows", i)} />
                </div>
              </div>
              <label className="field" style={{ marginTop: 12 }}>
                Pós-condições
                <input aria-label={`Pós-condições ${u.code}`} value={u.postconditions} placeholder="Empréstimo registrado e livro indisponível" onChange={(e) => store.updateUseCase(u.id, { postconditions: e.target.value })} />
              </label>
              {p.stories.length > 0 && (
                <div className="field" style={{ marginTop: 12 }}>
                  Realiza as histórias
                  <div className="chips">
                    {p.stories.map((s, si) => (
                      <button key={s.id} type="button" className={`chip ${u.storyIds.includes(s.id) ? "on" : ""}`} title={`${s.role}: ${s.action}`} onClick={() => store.toggleUseCaseStory(u.id, s.id)} aria-pressed={u.storyIds.includes(s.id)}>
                        H{si + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {issues.length > 0 && (
                <div className="issues" style={{ marginTop: 12 }}>
                  {issues.map((x) => (
                    <span className="issue" key={x}>
                      <Icon name="alert" size={13} /> {x}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <datalist id="atores">
          {p.problem.stakeholders
            .filter((x) => x.trim())
            .map((x) => (
              <option key={x} value={x} />
            ))}
        </datalist>
        <div className="add-bar">
          <button className="secondary-button" onClick={() => store.addUseCase()}>
            <Icon name="plus" size={16} /> Novo caso de uso
          </button>
        </div>
      </div>

      <div className="card canvas-card">
        <div className="canvas-toolbar">
          <strong>Diagrama de casos de uso (gerado automaticamente)</strong>
          <Link className="text-button" href="/diagramas/casos-de-uso">
            Abrir em tela cheia <Icon name="chevron" size={14} />
          </Link>
        </div>
        <div className="canvas">
          <UseCaseDiagramSvg project={p} />
        </div>
      </div>
    </div>
  );
});
