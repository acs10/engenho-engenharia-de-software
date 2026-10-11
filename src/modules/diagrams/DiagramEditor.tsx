"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { DIAGRAM_LABEL, RELATION_LABEL } from "@/modules/domain/curriculum";
import { diagramToMermaid } from "@/modules/domain/export";
import { suggestClasses } from "@/modules/domain/rules";
import type { Diagram, RelationKind, Visibility } from "@/modules/domain/types";
import { AppShell } from "@/modules/shell/AppShell";
import { useStudy } from "@/modules/study/StudyProvider";
import { ClassDiagramSvg, downloadSvg, SequenceDiagramSvg } from "./render";

const RELATION_HELP: Record<RelationKind, string> = {
  associacao: "A se relaciona com B",
  heranca: "A é um B (A herda de B)",
  composicao: "A é composto por B (B não vive sem A)",
  agregacao: "A tem B (B existe sozinho)",
  dependencia: "A usa B de passagem",
};

export const DiagramEditor = observer(function DiagramEditor({ id }: { id: string }) {
  const store = useStudy();
  const router = useRouter();
  const d = store.diagram(id);
  const [showCode, setShowCode] = useState(false);
  if (!d) {
    return (
      <AppShell crumb="Diagrama">
        <div className="card locked-card">
          <span>
            <Icon name="diagram" size={26} />
          </span>
          <h2>Diagrama não encontrado</h2>
          <p>Ele pode ter sido excluído ou pertencer a outro projeto. Troque de projeto em Meus projetos ou crie um novo diagrama.</p>
          <Link className="primary-button large" href="/diagramas">
            Ver diagramas
          </Link>
        </div>
      </AppShell>
    );
  }
  const svgId = `svg-${d.id}`;
  const mermaid = diagramToMermaid(d);
  return (
    <AppShell crumb={DIAGRAM_LABEL[d.type]}>
      <div className="page-head">
        <div>
          <span className="eyebrow">LABORATÓRIO UML · {DIAGRAM_LABEL[d.type].toUpperCase()}</span>
          <input className="input" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, maxWidth: 560, background: "transparent" }} aria-label="Título do diagrama" defaultValue={d.title} onBlur={(e) => store.renameDiagram(d.id, e.target.value)} />
        </div>
        <div className="page-head-actions">
          <button
            className="danger-button"
            onClick={() => {
              if (!window.confirm("Excluir este diagrama?")) return;
              store.deleteDiagram(d.id);
              toast.success("Diagrama excluído.");
              router.push("/diagramas");
            }}
          >
            <Icon name="trash" size={15} /> Excluir
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-panel">{d.type === "class" ? <ClassPanel d={d} /> : <SequencePanel d={d} />}</div>
        <div className="card canvas-card">
          <div className="canvas-toolbar">
            <strong>{d.type === "class" ? `${d.classes.length} classes · ${d.relations.length} relacionamentos` : `${d.participants.length} participantes · ${d.messages.length} mensagens`}</strong>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="secondary-button" onClick={() => setShowCode(!showCode)}>
                <Icon name="file" size={15} /> {showCode ? "Ocultar código" : "Código Mermaid"}
              </button>
              <button className="secondary-button" onClick={() => (downloadSvg(svgId, d.title) ? toast.success("Imagem SVG baixada.") : toast.error("Desenhe algo antes de baixar."))}>
                <Icon name="download" size={15} /> Baixar SVG
              </button>
            </div>
          </div>
          <div className="canvas">{d.type === "class" ? <ClassDiagramSvg diagram={d} id={svgId} /> : <SequenceDiagramSvg diagram={d} id={svgId} />}</div>
          {showCode && (
            <>
              <div className="canvas-toolbar">
                <span className="hint" style={{ margin: 0 }}>
                  Cole em mermaid.live, no GitHub ou no VS Code para reaproveitar.
                </span>
                <button
                  className="text-button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(mermaid);
                    toast.success("Código copiado.");
                  }}
                >
                  <Icon name="copy" size={14} /> Copiar
                </button>
              </div>
              <pre className="mermaid-box">{mermaid}</pre>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
});

const ClassPanel = observer(function ClassPanel({ d }: { d: Diagram }) {
  const store = useStudy();
  const [name, setName] = useState("");
  const [rel, setRel] = useState<{ from: string; to: string; kind: RelationKind; label: string }>({ from: "", to: "", kind: "associacao", label: "" });
  const suggestions = store.project ? suggestClasses(store.project) : [];
  const add = (n: string) => {
    const err = store.addClass(d.id, n);
    if (err) return void toast.error(err);
    setName("");
  };
  const className = (cid: string) => d.classes.find((c) => c.id === cid)?.name ?? "?";
  return (
    <>
      <div className="card">
        <p className="panel-title">CLASSES</p>
        <form
          className="inline-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            add(name);
          }}
        >
          <input className="input" aria-label="Nome da nova classe" value={name} placeholder="Ex.: Emprestimo" onChange={(e) => setName(e.target.value)} />
          <button className="primary-button" type="submit">
            <Icon name="plus" size={15} /> Classe
          </button>
        </form>
        {suggestions.length > 0 && (
          <div className="suggestions" aria-label="Sugestões de classes">
            {suggestions.map((s) => (
              <button key={s} className="chip" onClick={() => add(s)} title="Substantivo encontrado nos seus casos de uso">
                + {s}
              </button>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          {d.classes.map((c) => (
            <ClassItem key={c.id} diagramId={d.id} classId={c.id} />
          ))}
        </div>
      </div>

      <div className="card">
        <p className="panel-title">RELACIONAMENTOS</p>
        {d.classes.length < 2 ? (
          <p className="hint">Crie ao menos 2 classes para relacioná-las.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const err = store.addRelation(d.id, rel.from, rel.to, rel.kind, rel.label);
              if (err) return void toast.error(err);
              setRel({ ...rel, label: "" });
            }}
          >
            <div className="form-grid-2">
              <select className="input" aria-label="Classe A" value={rel.from} onChange={(e) => setRel({ ...rel, from: e.target.value })}>
                <option value="">Classe A…</option>
                {d.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select className="input" aria-label="Classe B" value={rel.to} onChange={(e) => setRel({ ...rel, to: e.target.value })}>
                <option value="">Classe B…</option>
                {d.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <select className="input" style={{ marginTop: 8 }} aria-label="Tipo de relacionamento" value={rel.kind} onChange={(e) => setRel({ ...rel, kind: e.target.value as RelationKind })}>
              {(Object.keys(RELATION_LABEL) as RelationKind[]).map((k) => (
                <option key={k} value={k}>
                  {RELATION_LABEL[k]} — {RELATION_HELP[k]}
                </option>
              ))}
            </select>
            <div className="inline-form" style={{ marginTop: 8 }}>
              <input className="input" aria-label="Rótulo (opcional)" value={rel.label} placeholder="Rótulo (ex.: realiza, 1..*)" onChange={(e) => setRel({ ...rel, label: e.target.value })} />
              <button className="primary-button" type="submit">
                Ligar
              </button>
            </div>
          </form>
        )}
        <div style={{ marginTop: 10 }}>
          {d.relations.map((r) => (
            <div className="relation-row" key={r.id}>
              <span>
                <b>{className(r.from)}</b> {RELATION_LABEL[r.kind].toLowerCase()} <b>{className(r.to)}</b>
                {r.label && <em> · {r.label}</em>}
              </span>
              <button className="icon-btn danger" onClick={() => store.removeRelation(d.id, r.id)} aria-label="Remover relacionamento">
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

const ClassItem = observer(function ClassItem({ diagramId, classId }: { diagramId: string; classId: string }) {
  const store = useStudy();
  const c = store.diagram(diagramId)?.classes.find((x) => x.id === classId);
  const [attr, setAttr] = useState("");
  const [method, setMethod] = useState("");
  if (!c) return null;
  const add = (kind: "attributes" | "methods", text: string, reset: () => void) => {
    const err = store.addMember(diagramId, c.id, kind, text);
    if (err) return void toast.error(err);
    reset();
  };
  const members = (kind: "attributes" | "methods") =>
    c[kind].map((m) => (
      <div className="member-row" key={m.id}>
        <select className="input" aria-label="Visibilidade" value={m.visibility} onChange={(e) => store.updateMember(diagramId, c.id, kind, m.id, { visibility: e.target.value as Visibility })}>
          <option value="+">+</option>
          <option value="-">−</option>
          <option value="#">#</option>
        </select>
        <input className="input" aria-label={kind === "attributes" ? "Atributo" : "Método"} value={m.text} onChange={(e) => store.updateMember(diagramId, c.id, kind, m.id, { text: e.target.value })} />
        <button className="icon-btn danger" onClick={() => store.removeMember(diagramId, c.id, kind, m.id)} aria-label="Remover membro">
          <Icon name="x" size={13} />
        </button>
      </div>
    ));
  return (
    <div className="class-item">
      <div className="class-item-head">
        <input
          className="input"
          aria-label={`Nome da classe ${c.name}`}
          defaultValue={c.name}
          onBlur={(e) => {
            const err = store.renameClass(diagramId, c.id, e.target.value);
            if (err) {
              toast.error(err);
              e.target.value = c.name;
            }
          }}
        />
        <button className="icon-btn danger" onClick={() => store.removeClass(diagramId, c.id)} aria-label={`Remover classe ${c.name}`}>
          <Icon name="trash" size={14} />
        </button>
      </div>
      <div className="member-group">
        <span>ATRIBUTOS</span>
        {members("attributes")}
        <form
          className="member-row"
          onSubmit={(e) => {
            e.preventDefault();
            add("attributes", attr, () => setAttr(""));
          }}
        >
          <input className="input" aria-label={`Novo atributo de ${c.name}`} value={attr} placeholder="titulo: String" onChange={(e) => setAttr(e.target.value)} />
          <button className="icon-btn" type="submit" aria-label="Adicionar atributo">
            <Icon name="plus" size={13} />
          </button>
        </form>
      </div>
      <div className="member-group">
        <span>MÉTODOS</span>
        {members("methods")}
        <form
          className="member-row"
          onSubmit={(e) => {
            e.preventDefault();
            add("methods", method, () => setMethod(""));
          }}
        >
          <input className="input" aria-label={`Novo método de ${c.name}`} value={method} placeholder="emprestar(aluno): void" onChange={(e) => setMethod(e.target.value)} />
          <button className="icon-btn" type="submit" aria-label="Adicionar método">
            <Icon name="plus" size={13} />
          </button>
        </form>
      </div>
    </div>
  );
});

const SequencePanel = observer(function SequencePanel({ d }: { d: Diagram }) {
  const store = useStudy();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState({ from: d.participants[0] ?? "", to: d.participants[1] ?? "", text: "", reply: false });
  const actors = [...new Set((store.project?.useCases ?? []).map((u) => u.actor).filter((a) => a.trim() && !d.participants.includes(a)))];
  const addParticipant = (n: string) => {
    const err = store.addParticipant(d.id, n);
    if (err) return void toast.error(err);
    setName("");
  };
  return (
    <>
      <div className="card">
        <p className="panel-title">PARTICIPANTES</p>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            addParticipant(name);
          }}
        >
          <input className="input" aria-label="Novo participante" value={name} placeholder="Ex.: Aluno, :Biblioteca, BancoDeDados" onChange={(e) => setName(e.target.value)} />
          <button className="primary-button" type="submit">
            <Icon name="plus" size={15} />
          </button>
        </form>
        {actors.length > 0 && (
          <div className="suggestions">
            {actors.map((a) => (
              <button key={a} className="chip" onClick={() => addParticipant(a)} title="Ator dos seus casos de uso">
                + {a}
              </button>
            ))}
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          {d.participants.map((p) => (
            <div className="relation-row" key={p}>
              <b>{p}</b>
              <button className="icon-btn danger" onClick={() => store.removeParticipant(d.id, p)} aria-label={`Remover ${p}`}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="panel-title">MENSAGENS</p>
        {d.participants.length < 1 ? (
          <p className="hint">Adicione participantes primeiro.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const err = store.addMessage(d.id, msg);
              if (err) return void toast.error(err);
              setMsg({ ...msg, text: "" });
            }}
          >
            <div className="form-grid-2">
              <select className="input" aria-label="De" value={msg.from} onChange={(e) => setMsg({ ...msg, from: e.target.value })}>
                <option value="">De…</option>
                {d.participants.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <select className="input" aria-label="Para" value={msg.to} onChange={(e) => setMsg({ ...msg, to: e.target.value })}>
                <option value="">Para…</option>
                {d.participants.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="inline-form" style={{ marginTop: 8 }}>
              <input className="input" aria-label="Mensagem" value={msg.text} placeholder={msg.reply ? "livro encontrado" : "buscarLivro(codigo)"} onChange={(e) => setMsg({ ...msg, text: e.target.value })} />
              <button className="primary-button" type="submit">
                Enviar
              </button>
            </div>
            <label className="hint" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={msg.reply} onChange={(e) => setMsg({ ...msg, reply: e.target.checked })} /> É uma resposta (seta tracejada)
            </label>
          </form>
        )}
        <div style={{ marginTop: 10 }}>
          {d.messages.map((m, i) => (
            <div className="message-row" key={m.id}>
              <span>
                {i + 1}. <b>{m.from}</b> → <b>{m.to}</b>: {m.text}
                {m.reply && <em> (resposta)</em>}
              </span>
              <span style={{ display: "flex", gap: 4 }}>
                <button className="icon-btn" onClick={() => store.moveMessage(d.id, m.id, -1)} aria-label="Subir mensagem" disabled={i === 0}>
                  <Icon name="arrow-up" size={13} />
                </button>
                <button className="icon-btn" onClick={() => store.moveMessage(d.id, m.id, 1)} aria-label="Descer mensagem" disabled={i === d.messages.length - 1}>
                  <Icon name="arrow-down" size={13} />
                </button>
                <button className="icon-btn danger" onClick={() => store.removeMessage(d.id, m.id)} aria-label="Remover mensagem">
                  <Icon name="x" size={13} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
