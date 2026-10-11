"use client";

import { observer } from "@/core/state/mobx";
import { ListEditor } from "@/core/ui/ListEditor";
import { useStudy } from "@/modules/study/StudyProvider";

/** Etapa 1 — definição do problema. */
export const ProblemEditor = observer(function ProblemEditor() {
  const store = useStudy();
  const pr = store.project!.problem;
  return (
    <div>
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Contexto</h3>
            <p>Como o trabalho é feito hoje e qual é a dor principal? Escreva como se explicasse para alguém de fora.</p>
          </div>
          <span className={`badge ${pr.context.trim().length >= 40 ? "badge-green" : "badge-gray"}`}>{pr.context.trim().length} / 40+</span>
        </div>
        <textarea className="input" aria-label="Contexto do problema" rows={4} value={pr.context} placeholder="Ex.: A biblioteca controla empréstimos em um caderno…" onChange={(e) => store.updateProblem({ context: e.target.value })} />
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Objetivos</h3>
              <p>O que deve melhorar? Prefira resultados mensuráveis.</p>
            </div>
          </div>
          <ListEditor label="Objetivo" items={pr.objectives} placeholder="Ex.: Reduzir o inventário de 5 para 1 dia" addLabel="Adicionar objetivo" onChange={(i, v) => store.setProblemItem("objectives", i, v)} onAdd={() => store.addProblemItem("objectives")} onRemove={(i) => store.removeProblemItem("objectives", i)} />
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Partes interessadas</h3>
              <p>Quem usa, decide, paga ou é afetado pelo sistema?</p>
            </div>
          </div>
          <ListEditor label="Parte interessada" items={pr.stakeholders} placeholder="Ex.: Bibliotecária" addLabel="Adicionar parte interessada" onChange={(i, v) => store.setProblemItem("stakeholders", i, v)} onAdd={() => store.addProblemItem("stakeholders")} onRemove={(i) => store.removeProblemItem("stakeholders", i)} />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <label className="field">
            Escopo — o que o sistema vai fazer
            <textarea aria-label="Escopo" rows={3} value={pr.scope} placeholder="Ex.: Cadastro de livros, empréstimos, devoluções…" onChange={(e) => store.updateProblem({ scope: e.target.value })} />
          </label>
        </div>
        <div className="card">
          <label className="field">
            Fora do escopo — o que NÃO será feito
            <textarea aria-label="Fora do escopo" rows={3} value={pr.outOfScope} placeholder="Ex.: Venda de livros, integração financeira…" onChange={(e) => store.updateProblem({ outOfScope: e.target.value })} />
          </label>
        </div>
      </div>
    </div>
  );
});
