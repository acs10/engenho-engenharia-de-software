"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { GLOSSARY, MODELS, STEPS } from "@/modules/domain/curriculum";
import type { StudyData } from "@/modules/domain/types";
import { downloadText } from "@/modules/projects/ProjectsPage";
import { AppShell } from "@/modules/shell/AppShell";
import { useStudy } from "@/modules/study/StudyProvider";

export const LibraryPage = observer(function LibraryPage() {
  const store = useStudy();
  const p = store.project;
  return (
    <AppShell crumb="Biblioteca">
      <div className="page-head">
        <div>
          <span className="eyebrow">BIBLIOTECA</span>
          <h1>Tudo o que compõe a engenharia de software</h1>
          <p>As lições de todas as etapas, os modelos de processo, o glossário e a rastreabilidade do seu projeto — num lugar só para consultar quando quiser.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Modelos de desenvolvimento</h3>
            <p>O modelo muda a ordem e o ritmo do trabalho. No Engenho, ele decide se as etapas abrem em sequência ou livremente.</p>
          </div>
        </div>
        <div className="grid-2">
          {MODELS.map((m) => (
            <div key={m.id} className={`card model-card-lib ${p?.model === m.id ? "on" : ""}`} style={{ marginTop: 0 }}>
              <h3>
                {m.name} {p?.model === m.id && <span className="badge badge-purple">seu projeto</span>}
              </h3>
              <p>{m.summary}</p>
              <p style={{ marginTop: 8 }}>
                <b>Etapas:</b> {m.sequential ? "em ordem" : "livres"} · <b>Estimativa:</b> {m.estimate}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Lições das 6 etapas</h3>
            <p>O mesmo conteúdo das etapas, para revisar a qualquer momento.</p>
          </div>
        </div>
        <div className="lesson-index">
          {STEPS.map((s, i) => (
            <details key={s.title}>
              <summary>
                <span className="code-badge">{i + 1}</span> {s.title}
                <small style={{ color: "var(--muted)", fontWeight: 500 }}>— {s.subtitle}</small>
              </summary>
              <div style={{ marginTop: 12 }}>
                {s.lesson.map((l) => (
                  <div className="lesson-section" key={l.title}>
                    <h3>{l.title}</h3>
                    <p>{l.body}</p>
                    {l.example && (
                      <div className="example">
                        <b>EXEMPLO</b>
                        {l.example}
                      </div>
                    )}
                  </div>
                ))}
                <Link className="text-button" href={`/etapas/${i + 1}`}>
                  Praticar esta etapa <Icon name="chevron" size={14} />
                </Link>
              </div>
            </details>
          ))}
        </div>
      </div>

      {p && (
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Matriz de rastreabilidade — {p.name}</h3>
              <p>Cada requisito deve ser atendido por ao menos uma história, e cada história realizada por um caso de uso.</p>
            </div>
          </div>
          {p.requirements.length ? (
            <div style={{ overflowX: "auto" }}>
              <table className="trace-table">
                <thead>
                  <tr>
                    <th>REQUISITO</th>
                    <th>HISTÓRIAS</th>
                    <th>CASOS DE USO</th>
                    <th>SITUAÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {p.requirements.map((r) => {
                    const stories = p.stories.map((s, i) => ({ s, i })).filter(({ s }) => s.requirementIds.includes(r.id));
                    const ucs = p.useCases.filter((u) => stories.some(({ s }) => u.storyIds.includes(s.id)));
                    return (
                      <tr key={r.id}>
                        <td>
                          <span className="code-badge">{r.code}</span> {r.text}
                        </td>
                        <td>{stories.map(({ i }) => `H${i + 1}`).join(", ") || "—"}</td>
                        <td>{ucs.map((u) => u.code).join(", ") || "—"}</td>
                        <td>{!stories.length ? <span className="badge badge-amber">sem história</span> : !ucs.length ? <span className="badge badge-gray">sem caso de uso</span> : <span className="badge badge-green">rastreado</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="hint">Cadastre requisitos na etapa 2 para ver a matriz.</p>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Glossário</h3>
            <p>{GLOSSARY.length} termos essenciais para quem está começando.</p>
          </div>
        </div>
        <dl className="glossary">
          {GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt>{g.term}</dt>
              <dd>{g.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </AppShell>
  );
});

const FAQ = [
  { q: "Preciso criar conta?", a: "Não. O Engenho funciona sem login: seus projetos ficam salvos automaticamente neste navegador. Para não perder nada (ou estudar em outro computador), use Meus projetos → baixar cópia (.json) e depois Importar." },
  { q: "Como as etapas são liberadas?", a: "Cada etapa tem 3 atividades: ler o conteúdo, praticar no seu projeto e acertar o questionário. No Modelo em Cascata e no Espiral as etapas abrem em ordem; no Ágil e na Prototipação você pode ir e voltar livremente." },
  { q: "O que o “corretor” de requisitos verifica?", a: "Termos vagos (rápido, fácil, amigável, etc.), textos curtos demais, ausência de “O sistema deve…” e requisitos não funcionais sem números. São dicas de estudo — o objetivo é aprender a escrever requisitos testáveis." },
  { q: "Os diagramas são desenhados à mão?", a: "Não: você descreve o MODELO (classes, atributos, métodos, relacionamentos, mensagens) e o Engenho desenha em UML automaticamente. Dá para baixar em SVG e copiar o código Mermaid para usar no GitHub ou no VS Code." },
  { q: "De onde vem o diagrama de casos de uso?", a: "Ele é gerado a partir dos casos de uso da etapa 4: cada ator vira um boneco ligado às funcionalidades que usa." },
  { q: "Como entrego o trabalho?", a: "Em Meus projetos, o botão de documento exporta o projeto inteiro em Markdown (.md), com todas as etapas e os diagramas em Mermaid — pronto para abrir no GitHub, no VS Code ou converter em PDF." },
];

export function HelpPage() {
  return (
    <AppShell crumb="Ajuda e recursos">
      <div className="page-head">
        <div>
          <span className="eyebrow">AJUDA E RECURSOS</span>
          <h1>Como estudar com o Engenho</h1>
          <p>Escolha um projeto, siga as 6 etapas e construa, peça por peça, a especificação completa de um sistema.</p>
        </div>
      </div>
      <div className="grid-3">
        {[
          ["1", "Escolha um projeto", "Use um modelo pronto (Biblioteca, Delivery, Clínica) ou comece do zero."],
          ["2", "Siga as etapas", "Leia, pratique no seu projeto e responda o questionário de cada etapa."],
          ["3", "Gere os artefatos", "Diagramas UML desenhados automaticamente e o documento final exportado."],
        ].map(([n, t, d]) => (
          <div className="card" key={n} style={{ marginTop: 0 }}>
            <span className="code-badge">{n}</span>
            <h3 style={{ margin: "12px 0 6px", fontSize: 15 }}>{t}</h3>
            <p className="hint" style={{ fontSize: 13 }}>
              {d}
            </p>
          </div>
        ))}
      </div>
      <div className="card faq" style={{ marginTop: 16 }}>
        {FAQ.map((f) => (
          <div className="lesson-section" key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export const SettingsPage = observer(function SettingsPage() {
  const store = useStudy();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(store.userName);
  return (
    <AppShell crumb="Configurações">
      <div className="page-head">
        <div>
          <span className="eyebrow">CONFIGURAÇÕES</span>
          <h1>Seus dados de estudo</h1>
          <p>Sem login: tudo fica neste navegador. Aqui você faz cópia de segurança, restaura ou recomeça.</p>
        </div>
      </div>
      <div className="grid-2">
        <div className="card" style={{ marginTop: 0 }}>
          <label className="field">
            Como quer ser chamado(a)?
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                store.setUserName(name);
                toast.success("Nome salvo.");
              }}
            />
            <small>Aparece no documento exportado.</small>
          </label>
        </div>
        <div className="card" style={{ marginTop: 0 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Cópia de segurança</h3>
          <p className="hint" style={{ marginBottom: 12 }}>
            {store.projects.length} projeto(s) salvos neste navegador.
          </p>
          <div className="add-bar" style={{ marginTop: 0 }}>
            <button
              className="secondary-button"
              onClick={() => {
                downloadText(JSON.stringify(store.snapshot, null, 2), "engenho-backup.json", "application/json");
                toast.success("Backup baixado.");
              }}
            >
              <Icon name="download" size={15} /> Baixar backup
            </button>
            <button className="secondary-button" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={15} /> Restaurar backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  const data = JSON.parse(await file.text()) as StudyData;
                  if (!Array.isArray(data.projects)) throw new Error();
                  if (!window.confirm("Substituir todos os projetos deste navegador pelo backup?")) return;
                  store.replaceAll(data);
                  toast.success("Backup restaurado.");
                } catch {
                  toast.error("Arquivo de backup inválido.");
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="card">
        <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Recomeçar</h3>
        <p className="hint" style={{ marginBottom: 12 }}>
          Volta ao projeto de demonstração (Sistema de Biblioteca). Seus projetos atuais serão apagados deste navegador.
        </p>
        <button
          className="danger-button"
          onClick={() => {
            if (!window.confirm("Apagar todos os projetos e voltar à demonstração?")) return;
            store.resetDemo();
            setName(store.userName);
            toast.success("Demonstração restaurada.");
          }}
        >
          <Icon name="trash" size={15} /> Restaurar demonstração
        </button>
      </div>
    </AppShell>
  );
});
