"use client";

import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { PRIORITY_LABEL } from "@/modules/domain/curriculum";
import { requirementIssues } from "@/modules/domain/rules";
import type { Priority } from "@/modules/domain/types";
import { useStudy } from "@/modules/study/StudyProvider";

/** Etapa 2 — requisitos com verificação de qualidade em tempo real. */
export const RequirementsEditor = observer(function RequirementsEditor() {
  const store = useStudy();
  const p = store.project!;
  const rf = p.requirements.filter((r) => r.kind === "funcional").length;
  const rnf = p.requirements.length - rf;
  const counts = (["must", "should", "could", "wont"] as Priority[]).map((k) => [k, p.requirements.filter((r) => r.priority === k).length] as const);

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Lista de requisitos</h3>
          <p>Escreva cada requisito começando por “O sistema deve…”. O Engenho aponta termos vagos e o que dá para melhorar.</p>
        </div>
        <div className="count-pills">
          <span className={`badge ${rf >= 3 ? "badge-green" : "badge-gray"}`}>{rf} funcionais</span>
          <span className={`badge ${rnf >= 1 ? "badge-green" : "badge-gray"}`}>{rnf} não funcionais</span>
        </div>
      </div>

      {!p.requirements.length && <p className="hint">Nenhum requisito ainda. Comece pelos funcionais: o que o sistema precisa fazer para atingir os objetivos da etapa 1?</p>}

      <div className="req-list">
        {p.requirements.map((r) => {
          const issues = requirementIssues(r);
          return (
            <div className="req-row" key={r.id}>
              <span className="code-badge" title={r.kind === "funcional" ? "Requisito funcional" : "Requisito não funcional"}>
                {r.code}
              </span>
              <textarea className="input" aria-label={`Texto do requisito ${r.code}`} value={r.text} rows={2} placeholder={r.kind === "funcional" ? "O sistema deve permitir…" : "O sistema deve responder em até… / estar disponível…"} onChange={(e) => store.updateRequirement(r.id, { text: e.target.value })} />
              <select className="input" aria-label={`Prioridade de ${r.code}`} value={r.priority} onChange={(e) => store.updateRequirement(r.id, { priority: e.target.value as Priority })}>
                {(Object.keys(PRIORITY_LABEL) as Priority[]).map((k) => (
                  <option key={k} value={k}>
                    {PRIORITY_LABEL[k]}
                  </option>
                ))}
              </select>
              <button className="icon-btn danger" onClick={() => store.removeRequirement(r.id)} aria-label={`Remover ${r.code}`}>
                <Icon name="trash" size={15} />
              </button>
              <div className="issues">
                {issues.length ? (
                  issues.map((i) => (
                    <span className="issue" key={i}>
                      <Icon name="alert" size={13} /> {i}
                    </span>
                  ))
                ) : (
                  <span className="ok-line">
                    <Icon name="check" size={13} /> Claro e verificável
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="add-bar">
        <button className="secondary-button" onClick={() => store.addRequirement("funcional")}>
          <Icon name="plus" size={16} /> Requisito funcional
        </button>
        <button className="secondary-button" onClick={() => store.addRequirement("nao-funcional")}>
          <Icon name="plus" size={16} /> Requisito não funcional
        </button>
      </div>

      {p.requirements.length > 0 && (
        <p className="hint">
          Priorização MoSCoW: {counts.map(([k, n]) => `${PRIORITY_LABEL[k].split(" · ")[0]} ${n}`).join(" · ")}. Se tudo é “Must”, nada é prioridade.
        </p>
      )}
    </div>
  );
});
