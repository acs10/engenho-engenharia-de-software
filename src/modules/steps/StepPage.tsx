"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { modelInfo, STEPS } from "@/modules/domain/curriculum";
import { nextStep } from "@/modules/domain/rules";
import { AppShell } from "@/modules/shell/AppShell";
import { useStudy } from "@/modules/study/StudyProvider";
import { ContractsEditor } from "./editors/ContractsEditor";
import { DiagramsStep } from "./editors/DiagramsStep";
import { ProblemEditor } from "./editors/ProblemEditor";
import { RequirementsEditor } from "./editors/RequirementsEditor";
import { StoriesEditor } from "./editors/StoriesEditor";
import { UseCasesEditor } from "./editors/UseCasesEditor";
import { Quiz } from "./Quiz";

type Tab = "conteudo" | "pratica" | "questionario";

const EDITORS = [ProblemEditor, RequirementsEditor, StoriesEditor, UseCasesEditor, DiagramsStep, ContractsEditor];

export const StepPage = observer(function StepPage({ index }: { index: number }) {
  const store = useStudy();
  const router = useRouter();
  const p = store.project;
  const step = STEPS[index];
  const [tab, setTab] = useState<Tab>("conteudo");
  useEffect(() => {
    if (!p) router.replace("/projetos?novo=1");
  }, [p, router]);
  useEffect(() => {
    // Quem já leu cai direto na prática.
    if (p?.read.includes(index)) setTab("pratica");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, p?.id]);

  if (!p) return null;
  const model = modelInfo(p.model);
  const done = p.completed.includes(index);
  const missing = store.missingFor(index);
  const quiz = store.quizScore(index);
  const Editor = EDITORS[index];

  if (!store.canOpen(index)) {
    const n = nextStep(p);
    return (
      <AppShell crumb={`Etapa ${index + 1}`}>
        <div className="card locked-card">
          <span>
            <Icon name="lock" size={26} />
          </span>
          <h2>Etapa {index + 1} ainda bloqueada</h2>
          <p>
            No <b>{model.name}</b>, as etapas são liberadas em ordem. Conclua a etapa {n + 1} — <b>{STEPS[n].title}</b> — para avançar. Quer trabalhar fora de ordem? Troque para Desenvolvimento Ágil ou Prototipação na visão geral.
          </p>
          <Link className="primary-button large" href={`/etapas/${n + 1}`}>
            <Icon name="play" size={18} /> Ir para a etapa {n + 1}
          </Link>
        </div>
      </AppShell>
    );
  }

  const complete = () => {
    const err = store.completeStep(index);
    if (err) return void toast.error(err);
    toast.success(index === 5 ? "Projeto concluído! Exporte o documento em Meus projetos." : `Etapa ${index + 1} concluída!`);
    if (index < 5) router.push(`/etapas/${index + 2}`);
  };

  const items: { label: string; ok: boolean }[] = [
    { label: "Ler o conteúdo da etapa", ok: p.read.includes(index) },
    { label: step.goal, ok: !missing.some((m) => !m.startsWith("Ler") && !m.startsWith("Acertar")) },
    { label: `Acertar o questionário (${quiz.correct}/${quiz.total})`, ok: quiz.correct === quiz.total },
  ];
  const tabs: { id: Tab; label: string; ok: boolean }[] = [
    { id: "conteudo", label: "Conteúdo", ok: items[0].ok },
    { id: "pratica", label: "Prática no projeto", ok: items[1].ok },
    { id: "questionario", label: "Questionário", ok: items[2].ok },
  ];

  return (
    <AppShell crumb={`Etapa ${index + 1} · ${step.title}`}>
      <div className="step-page">
        <section className="current-step">
          <div className="step-content">
            <span className="eyebrow purple">ETAPA {index + 1} DE 6</span>
            <h2>{step.title}</h2>
            <p>{step.intro}</p>
            <div className="lesson-meta">
              <span>
                <Icon name="clock" size={17} /> {step.minutes} min
              </span>
              <span>
                <Icon name="file" size={17} /> 3 atividades
              </span>
              {done && (
                <span>
                  <Icon name="check" size={17} /> Concluída
                </span>
              )}
            </div>
            <div className="model-tip">
              <Icon name="sparkles" size={16} />
              <span>{model.tip}</span>
            </div>
          </div>
          <div className="lesson-visual">
            <div className="paper paper-back" />
            <div className="paper">
              <div className="paper-title">
                <span />
                <b>{step.paperTitle}</b>
              </div>
              <div className="paper-line long" />
              <div className="paper-line medium" />
              {items.map((it, i) => (
                <div className="check-line" key={i}>
                  <span style={it.ok ? { background: "var(--green)", borderColor: "var(--green)" } : { background: "transparent", borderColor: "#d2ccd4" }}>{it.ok && <Icon name="check" size={12} />}</span>
                  <i />
                </div>
              ))}
            </div>
            <div className="floating-tag">
              <Icon name="sparkles" size={15} /> {step.tag}
            </div>
          </div>
        </section>

        <div className="tabs" role="tablist">
          {tabs.map((t, i) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? "active" : ""} ${t.ok ? "done" : ""}`} onClick={() => setTab(t.id)}>
              <span className="tab-num">{t.ok ? <Icon name="check" size={11} /> : i + 1}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="step-layout">
          <div>
            {tab === "conteudo" && (
              <div className="card">
                {step.lesson.map((s) => (
                  <div className="lesson-section" key={s.title}>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                    {s.example && (
                      <div className="example">
                        <b>EXEMPLO</b>
                        {s.example}
                      </div>
                    )}
                  </div>
                ))}
                <div className="quiz-score">
                  <span>{p.read.includes(index) ? "Conteúdo lido ✓" : "Leu tudo? Marque e siga para a prática."}</span>
                  <button
                    className="primary-button"
                    onClick={() => {
                      store.markRead(index);
                      setTab("pratica");
                    }}
                  >
                    <Icon name="check" size={16} /> {p.read.includes(index) ? "Ir para a prática" : "Marcar como lido"}
                  </button>
                </div>
              </div>
            )}
            {tab === "pratica" && <Editor />}
            {tab === "questionario" && <Quiz index={index} />}
          </div>

          <aside className="card goal-card">
            {done && (
              <div className="done-banner">
                <span>
                  <Icon name="check" size={16} />
                </span>
                Etapa concluída
              </div>
            )}
            <h3>Para concluir esta etapa</h3>
            <p>As 3 atividades abaixo liberam o próximo passo da trilha.</p>
            <ul className="check-list">
              {items.map((it) => (
                <li key={it.label} className={it.ok ? "ok" : ""}>
                  <span>{it.ok && <Icon name="check" size={11} />}</span>
                  {it.label}
                </li>
              ))}
            </ul>
            {missing.length > 0 && !done && (
              <ul className="check-list">
                {missing
                  .filter((m) => !m.startsWith("Ler") && !m.startsWith("Acertar"))
                  .map((m) => (
                    <li key={m}>
                      <span />
                      Falta: {m}
                    </li>
                  ))}
              </ul>
            )}
            {done ? (
              <button className="secondary-button" style={{ width: "100%" }} onClick={() => store.reopenStep(index)}>
                Reabrir etapa para editar
              </button>
            ) : (
              <button className="primary-button" onClick={complete} disabled={missing.length > 0}>
                <Icon name="check" size={16} /> Concluir etapa
              </button>
            )}
          </aside>
        </div>

        <div className="step-nav">
          {index > 0 ? (
            <Link className="secondary-button" href={`/etapas/${index}`}>
              <Icon name="back" size={16} /> Etapa {index}: {STEPS[index - 1].title}
            </Link>
          ) : (
            <Link className="secondary-button" href="/">
              <Icon name="back" size={16} /> Visão geral
            </Link>
          )}
          {index < 5 && (
            <Link className="secondary-button" href={`/etapas/${index + 2}`}>
              Etapa {index + 2}: {STEPS[index + 1].title} <Icon name="chevron" size={16} />
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
});
