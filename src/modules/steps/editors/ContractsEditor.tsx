"use client";

import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { ListEditor } from "@/core/ui/ListEditor";
import { contractIssues } from "@/modules/domain/rules";
import { useStudy } from "@/modules/study/StudyProvider";

/** Etapa 6 — contratos de operação (pré e pós-condições). */
export const ContractsEditor = observer(function ContractsEditor() {
  const store = useStudy();
  const p = store.project!;
  const suggestions = store.suggestedOperations;
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Contratos de operação</h3>
          <p>Para cada operação importante: o que precisa ser verdade antes e o que muda no sistema depois (no passado).</p>
        </div>
        <span className="badge badge-purple">{p.contracts.length} contratos</span>
      </div>

      {suggestions.length > 0 && (
        <div className="example" style={{ marginBottom: 16 }}>
          <b>OPERAÇÕES DOS SEUS DIAGRAMAS</b>
          Clique para criar o contrato:
          <div className="suggestions">
            {suggestions.map((op) => (
              <button key={op} className="chip" onClick={() => store.addContract(op)}>
                {op}
              </button>
            ))}
          </div>
        </div>
      )}

      {p.contracts.map((c) => {
        const issues = contractIssues(c);
        return (
          <div className="contract-card" key={c.id}>
            <div className="card-row-head">
              <strong>
                Operação: <code>{c.operation || "…"}</code>
              </strong>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {issues.length ? <span className="badge badge-amber">{issues.length} pendência(s)</span> : <span className="badge badge-green">✓ Completo</span>}
                <button className="icon-btn danger" onClick={() => store.removeContract(c.id)} aria-label={`Remover contrato ${c.operation}`}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
            <div className="grid-2">
              <label className="field">
                Operação
                <input aria-label="Operação" value={c.operation} placeholder="registrarEmprestimo(matricula, codigoLivro)" onChange={(e) => store.updateContract(c.id, { operation: e.target.value })} />
              </label>
              <label className="field">
                Referência cruzada (caso de uso)
                <select aria-label="Referência" value={c.references} onChange={(e) => store.updateContract(c.id, { references: e.target.value })}>
                  <option value="">Escolha…</option>
                  {p.useCases.map((u) => (
                    <option key={u.id} value={u.code}>
                      {u.code} · {u.name || "sem nome"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field">
                Pré-condições
                <ListEditor label="Pré-condição" items={c.preconditions} placeholder="Existe um Aluno com a matrícula informada" addLabel="Adicionar pré-condição" onChange={(i, v) => store.setCondition(c.id, "preconditions", i, v)} onAdd={() => store.addCondition(c.id, "preconditions")} onRemove={(i) => store.removeCondition(c.id, "preconditions", i)} />
              </div>
              <div className="field">
                Pós-condições
                <ListEditor label="Pós-condição" items={c.postconditions} placeholder="Um Empréstimo foi criado" addLabel="Adicionar pós-condição" onChange={(i, v) => store.setCondition(c.id, "postconditions", i, v)} onAdd={() => store.addCondition(c.id, "postconditions")} onRemove={(i) => store.removeCondition(c.id, "postconditions", i)} />
              </div>
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

      <div className="add-bar">
        <button className="secondary-button" onClick={() => store.addContract()}>
          <Icon name="plus" size={16} /> Novo contrato
        </button>
      </div>
    </div>
  );
});
