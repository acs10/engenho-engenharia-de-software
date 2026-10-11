"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { Modal } from "@/core/ui/Modal";
import { MODELS, modelInfo, STEPS } from "@/modules/domain/curriculum";
import { projectToMarkdown } from "@/modules/domain/export";
import { nextStep, progressPercent } from "@/modules/domain/rules";
import { TEMPLATES } from "@/modules/domain/templates";
import type { ModelId, Project } from "@/modules/domain/types";
import { AppShell } from "@/modules/shell/AppShell";
import { useStudy } from "@/modules/study/StudyProvider";

export function downloadText(content: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").toLowerCase();

export const ProjectsPage = observer(function ProjectsPage() {
  const store = useStudy();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ name: string; description: string; model: ModelId; templateId: string }>({ name: "", description: "", model: "cascata", templateId: "" });
  // "?novo=1" abre a janela de criação (lido depois de montar, sem Suspense).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("novo")) setCreating(true);
  }, []);

  const create = () => {
    const err = store.createProject({ ...form, templateId: form.templateId || undefined });
    if (err) return void toast.error(err);
    setCreating(false);
    toast.success("Projeto criado! Vamos à primeira etapa.");
    router.push("/etapas/1");
  };
  const exportMd = (p: Project) => {
    downloadText(projectToMarkdown(p), `${slug(p.name)}.md`, "text/markdown");
    toast.success("Documento do projeto baixado (.md).");
  };
  const exportJson = (p: Project) => {
    downloadText(JSON.stringify(p, null, 2), `${slug(p.name)}.engenho.json`, "application/json");
    toast.success("Cópia do projeto baixada (.json).");
  };

  return (
    <AppShell crumb="Todos os projetos">
      <div className="page-head">
        <div>
          <span className="eyebrow">MEUS PROJETOS</span>
          <h1>Seus projetos de estudo</h1>
          <p>Cada projeto percorre as 6 etapas. Tudo fica salvo neste navegador — exporte para guardar ou levar para outro computador.</p>
        </div>
        <div className="page-head-actions">
          <button className="secondary-button" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={16} /> Importar
          </button>
          <button className="primary-button large" onClick={() => setCreating(true)}>
            <Icon name="plus" size={18} /> Novo projeto
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const err = store.importProject(JSON.parse(await file.text()));
                if (err) return void toast.error(err);
                toast.success("Projeto importado.");
              } catch {
                toast.error("Arquivo inválido.");
              }
            }}
          />
        </div>
      </div>

      {!store.projects.length && (
        <div className="card locked-card">
          <span>
            <Icon name="folder" size={26} />
          </span>
          <h2>Nenhum projeto ainda</h2>
          <p>Escolha um modelo pronto (Biblioteca, Delivery, Clínica) ou comece do zero.</p>
        </div>
      )}

      <div className="project-grid">
        {store.projects.map((p) => {
          const pct = progressPercent(p);
          const current = store.project?.id === p.id;
          return (
            <article className={`card project-card ${current ? "current" : ""}`} key={p.id}>
              <div className="card-row-head" style={{ marginBottom: 0 }}>
                <span className="badge badge-purple">{modelInfo(p.model).name}</span>
                {current ? <span className="badge badge-green">Projeto atual</span> : null}
              </div>
              <h3>{p.name}</h3>
              <p>{p.description || "Sem descrição."}</p>
              <div className="mini-track">
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="project-meta">
                <span>
                  {p.completed.length}/6 etapas · {pct}%
                </span>
                <span>{p.completed.length === 6 ? "Concluído" : STEPS[nextStep(p)].title}</span>
              </div>
              <div className="project-meta">
                <span>
                  {p.requirements.length} req. · {p.stories.length} hist. · {p.useCases.length} UC · {p.diagrams.length} diag.
                </span>
              </div>
              <div className="project-actions">
                {current ? (
                  <Link className="primary-button" href={`/etapas/${nextStep(p) + 1}`}>
                    <Icon name="play" size={15} /> Continuar
                  </Link>
                ) : (
                  <button
                    className="primary-button"
                    onClick={() => {
                      store.selectProject(p.id);
                      toast.success(`Projeto “${p.name}” aberto.`);
                      router.push("/");
                    }}
                  >
                    Abrir
                  </button>
                )}
                <button className="icon-btn" title="Exportar documento (.md)" aria-label={`Exportar documento de ${p.name}`} onClick={() => exportMd(p)}>
                  <Icon name="file" size={15} />
                </button>
                <button className="icon-btn" title="Baixar cópia (.json)" aria-label={`Baixar cópia de ${p.name}`} onClick={() => exportJson(p)}>
                  <Icon name="download" size={15} />
                </button>
                <button
                  className="icon-btn"
                  title="Duplicar"
                  aria-label={`Duplicar ${p.name}`}
                  onClick={() => {
                    store.duplicateProject(p.id);
                    toast.success("Projeto duplicado.");
                  }}
                >
                  <Icon name="copy" size={15} />
                </button>
                <button
                  className="icon-btn danger"
                  title="Excluir"
                  aria-label={`Excluir ${p.name}`}
                  onClick={() => {
                    if (!window.confirm(`Excluir o projeto “${p.name}”? Não dá para desfazer.`)) return;
                    store.deleteProject(p.id);
                    toast.success("Projeto excluído.");
                  }}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {creating && (
        <Modal title="Novo projeto" subtitle="Escolha um ponto de partida. Os modelos já trazem a definição do problema preenchida." onClose={() => setCreating(false)}>
          <div className="template-grid">
            <button className={`template-option ${!form.templateId ? "on" : ""}`} onClick={() => setForm({ ...form, templateId: "" })}>
              <strong>Em branco</strong>
              <small>Você define o problema do zero.</small>
            </button>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                className={`template-option ${form.templateId === t.id ? "on" : ""}`}
                onClick={() => setForm({ ...form, templateId: t.id, name: form.name || (store.projects.some((p) => p.name === t.name) ? `${t.name} 2` : t.name), description: form.description || t.description })}
              >
                <strong>{t.name}</strong>
                <small>{t.description}</small>
              </button>
            ))}
          </div>
          <label className="field" style={{ marginTop: 14 }}>
            Nome do projeto
            <input value={form.name} placeholder="Ex.: Sistema de Biblioteca" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            Descrição curta
            <input value={form.description} placeholder="Do que se trata o sistema?" onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="field">
            Modelo de desenvolvimento
            <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value as ModelId })}>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <small>{modelInfo(form.model).summary}</small>
          </label>
          <div className="modal-actions">
            <button className="secondary-button" onClick={() => setCreating(false)}>
              Cancelar
            </button>
            <button className="primary-button" onClick={create}>
              Criar projeto
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
});
