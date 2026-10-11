import type { Contract, Diagram, Project, Requirement, UseCase, UserStory } from "./types";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Palavras que tornam um requisito impossível de testar. */
export const VAGUE_WORDS = ["rapido", "rapida", "facil", "amigavel", "intuitivo", "intuitiva", "bonito", "bonita", "moderno", "moderna", "etc", "eficiente", "adequado", "adequada", "simples", "bom", "boa", "melhor", "otimo", "flexivel", "robusto", "user friendly", "agil"];

/** Dicas de qualidade para um requisito (vazio = ok). */
export function requirementIssues(r: Pick<Requirement, "text" | "kind">): string[] {
  const issues: string[] = [];
  const t = norm(r.text);
  if (r.text.trim().length < 15) issues.push("Muito curto: descreva o comportamento esperado.");
  const vague = VAGUE_WORDS.filter((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(t));
  if (vague.length) issues.push(`Termo vago: “${vague.join("”, “")}”. Use um critério mensurável.`);
  if (!/\b(deve|devera|precisa|permite|permitir)\b/.test(t)) issues.push("Comece com “O sistema deve…” para deixar claro que é uma obrigação.");
  if (r.kind === "nao-funcional" && !/\d/.test(t)) issues.push("Requisitos não funcionais costumam ter um número (tempo, %, quantidade).");
  return issues;
}

export function storyIssues(s: UserStory): string[] {
  const issues: string[] = [];
  if (s.role.trim().length < 3) issues.push("Informe o papel (quem?).");
  if (s.action.trim().length < 5) issues.push("Descreva a ação (o quê?).");
  if (s.benefit.trim().length < 5) issues.push("Explique o benefício (por quê?).");
  if (!s.criteria.some((c) => c.trim().length >= 5)) issues.push("Inclua ao menos 1 critério de aceitação.");
  if (s.points > 13) issues.push("Mais de 13 pontos: quebre em histórias menores.");
  if (!s.requirementIds.length) issues.push("Ligue a história a um requisito (rastreabilidade).");
  return issues;
}

export function useCaseIssues(u: UseCase): string[] {
  const issues: string[] = [];
  if (u.name.trim().length < 4) issues.push("Dê um nome com verbo no infinitivo (ex.: “Registrar empréstimo”).");
  if (u.actor.trim().length < 3) issues.push("Informe o ator principal.");
  if (u.mainFlow.filter((s) => s.trim()).length < 3) issues.push("O fluxo principal precisa de ao menos 3 passos.");
  if (u.postconditions.trim().length < 5) issues.push("Descreva a pós-condição.");
  return issues;
}

export function contractIssues(c: Contract): string[] {
  const issues: string[] = [];
  if (!/^[a-zA-Z_]\w*\s*\(.*\)$/.test(c.operation.trim())) issues.push("Escreva a operação como chamada: registrarEmprestimo(matricula, codigo).");
  if (c.references.trim().length < 2) issues.push("Informe o caso de uso de referência (ex.: UC01).");
  if (!c.preconditions.some((p) => p.trim())) issues.push("Inclua ao menos 1 pré-condição.");
  if (c.postconditions.filter((p) => p.trim()).length < 2) issues.push("Inclua ao menos 2 pós-condições.");
  return issues;
}

export const storyText = (s: Pick<UserStory, "role" | "action" | "benefit">) => `Como ${s.role || "…"}, quero ${s.action || "…"}, para ${s.benefit || "…"}.`;

/** Verifica cada etapa: o que falta para concluir (vazio = pode concluir). */
export function stepMissing(p: Project, step: number): string[] {
  const m: string[] = [];
  switch (step) {
    case 0: {
      if (p.problem.context.trim().length < 40) m.push("Contexto com ao menos 40 caracteres");
      if (!p.problem.objectives.some((o) => o.trim())) m.push("Ao menos 1 objetivo");
      if (!p.problem.stakeholders.some((o) => o.trim())) m.push("Ao menos 1 parte interessada");
      if (p.problem.scope.trim().length < 10) m.push("Escopo descrito");
      break;
    }
    case 1: {
      const rf = p.requirements.filter((r) => r.kind === "funcional");
      const rnf = p.requirements.filter((r) => r.kind === "nao-funcional");
      if (rf.length < 3) m.push(`3 requisitos funcionais (tem ${rf.length})`);
      if (rnf.length < 1) m.push("1 requisito não funcional");
      const bad = p.requirements.filter((r) => requirementIssues(r).length);
      if (bad.length) m.push(`Corrigir ${bad.length} requisito(s) com alertas de qualidade`);
      break;
    }
    case 2: {
      const ok = p.stories.filter((s) => !storyIssues(s).length);
      if (ok.length < 3) m.push(`3 histórias completas (tem ${ok.length})`);
      break;
    }
    case 3: {
      const ok = p.useCases.filter((u) => !useCaseIssues(u).length);
      if (ok.length < 2) m.push(`2 casos de uso completos (tem ${ok.length})`);
      break;
    }
    case 4: {
      const cls = p.diagrams.find((d) => d.type === "class" && d.classes.length >= 2 && d.relations.length >= 1);
      const seq = p.diagrams.find((d) => d.type === "sequence" && d.messages.length >= 2);
      if (!cls) m.push("Diagrama de classes com 2+ classes e 1 relacionamento");
      if (!seq) m.push("Diagrama de sequência com 2+ mensagens");
      break;
    }
    case 5: {
      const ok = p.contracts.filter((c) => !contractIssues(c).length);
      if (ok.length < 2) m.push(`2 contratos completos (tem ${ok.length})`);
      break;
    }
  }
  return m;
}

/** Questionário respondido com todas as respostas certas. */
export function quizPassed(p: Project, step: number, answers: number[]): boolean {
  const got = p.quiz[step] ?? [];
  return answers.length > 0 && answers.every((a, i) => got[i] === a);
}

/** Próxima etapa a estudar: a primeira não concluída. */
export const nextStep = (p: Project) => {
  for (let i = 0; i < 6; i++) if (!p.completed.includes(i)) return i;
  return 5;
};

export const progressPercent = (p: Project) => Math.round((p.completed.length / 6) * 100);

/** Classes sugeridas a partir dos substantivos dos casos de uso (ajuda para o laboratório UML). */
export function suggestClasses(p: Project): string[] {
  const words = new Map<string, number>();
  // Só palavras com maiúscula NO MEIO da frase (substantivos destacados: "informa o Livro");
  // a primeira palavra da frase costuma ser verbo ou artigo ("Registrar", "O").
  const sentences = [...p.useCases.flatMap((u) => [u.name, ...u.mainFlow, ...u.alternativeFlows]), ...p.requirements.map((r) => r.text)];
  for (const sentence of sentences) {
    const tokens = sentence.split(/[^A-Za-zÀ-ÿ]+/).filter(Boolean);
    for (const raw of tokens.slice(1)) {
      if (raw.length < 4 || raw[0] !== raw[0].toUpperCase() || raw === raw.toUpperCase()) continue;
      if (["Sistema", "Como", "Quando", "Então", "Dado", "Caso"].includes(raw)) continue;
      words.set(raw, (words.get(raw) ?? 0) + 1);
    }
  }
  const existing = new Set(p.diagrams.flatMap((d) => d.classes.map((c) => norm(c.name))));
  return [...words.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w).filter((w) => !existing.has(norm(w))).slice(0, 6);
}

export const emptyDiagram = (d: Pick<Diagram, "id" | "type" | "title">): Diagram => ({ ...d, updatedAt: new Date().toISOString(), classes: [], relations: [], participants: [], messages: [] });
