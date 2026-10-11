"use client";

import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { ListEditor } from "@/core/ui/ListEditor";
import { FIBONACCI } from "@/modules/domain/curriculum";
import { storyIssues } from "@/modules/domain/rules";
import { useStudy } from "@/modules/study/StudyProvider";

/** Etapa 3 — histórias de usuário com critérios de aceitação e rastreabilidade. */
export const StoriesEditor = observer(function StoriesEditor() {
  const store = useStudy();
  const p = store.project!;
  const total = p.stories.reduce((s, x) => s + x.points, 0);
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Backlog de histórias</h3>
          <p>Como [papel], quero [ação], para [benefício]. Ligue cada história aos requisitos que ela atende.</p>
        </div>
        <div className="count-pills">
          <span className="badge badge-purple">{p.stories.length} histórias</span>
          <span className="badge badge-gray">{total} pontos</span>
        </div>
      </div>

      {p.stories.map((s, i) => {
        const issues = storyIssues(s);
        return (
          <div className="story-card" key={s.id}>
            <div className="card-row-head">
              <strong>História H{i + 1}</strong>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {issues.length ? <span className="badge badge-amber">{issues.length} pendência(s)</span> : <span className="badge badge-green">✓ Completa</span>}
                <button className="icon-btn danger" onClick={() => store.removeStory(s.id)} aria-label={`Remover história H${i + 1}`}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
            <div className="story-sentence">
              Como <em>{s.role || "…"}</em>, quero <em>{s.action || "…"}</em>, para <em>{s.benefit || "…"}</em>.
            </div>
            <div className="story-fields">
              <label className="field">
                Papel
                <input aria-label={`Papel H${i + 1}`} list="papeis" value={s.role} placeholder="bibliotecária" onChange={(e) => store.updateStory(s.id, { role: e.target.value })} />
              </label>
              <label className="field">
                Ação (o quê)
                <input aria-label={`Ação H${i + 1}`} value={s.action} placeholder="ver os empréstimos atrasados" onChange={(e) => store.updateStory(s.id, { action: e.target.value })} />
              </label>
              <label className="field">
                Benefício (por quê)
                <input aria-label={`Benefício H${i + 1}`} value={s.benefit} placeholder="cobrar antes do fim do bimestre" onChange={(e) => store.updateStory(s.id, { benefit: e.target.value })} />
              </label>
              <label className="field">
                Pontos
                <select aria-label={`Pontos H${i + 1}`} value={s.points} onChange={(e) => store.updateStory(s.id, { points: Number(e.target.value) })}>
                  {[...FIBONACCI, 21].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              Critérios de aceitação
              <ListEditor label="Critério" items={s.criteria} placeholder="Dado… quando… então…" addLabel="Adicionar critério" onChange={(ci, v) => store.setCriterion(s.id, ci, v)} onAdd={() => store.addCriterion(s.id)} onRemove={(ci) => store.removeCriterion(s.id, ci)} />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              Atende aos requisitos
              {p.requirements.length ? (
                <div className="chips">
                  {p.requirements.map((r) => (
                    <button key={r.id} type="button" className={`chip ${s.requirementIds.includes(r.id) ? "on" : ""}`} title={r.text} onClick={() => store.toggleStoryRequirement(s.id, r.id)} aria-pressed={s.requirementIds.includes(r.id)}>
                      {r.code}
                    </button>
                  ))}
                </div>
              ) : (
                <small>Cadastre requisitos na etapa 2 para ligar as histórias a eles.</small>
              )}
            </div>
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

      <datalist id="papeis">
        {p.problem.stakeholders
          .filter((x) => x.trim())
          .map((x) => (
            <option key={x} value={x.toLowerCase()} />
          ))}
      </datalist>

      <div className="add-bar">
        <button className="secondary-button" onClick={() => store.addStory()}>
          <Icon name="plus" size={16} /> Nova história
        </button>
      </div>
    </div>
  );
});
