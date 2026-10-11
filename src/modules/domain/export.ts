import { modelInfo, PRIORITY_LABEL, RELATION_LABEL, STEPS } from "./curriculum";
import { storyText } from "./rules";
import type { Diagram, Project } from "./types";

const list = (items: string[]) => items.filter((i) => i.trim()).map((i) => `- ${i.trim()}`).join("\n") || "_(vazio)_";
const numbered = (items: string[]) => items.filter((i) => i.trim()).map((i, n) => `${n + 1}. ${i.trim()}`).join("\n") || "_(vazio)_";

/** Diagrama em notação Mermaid (abre no GitHub, VS Code e no mermaid.live). */
export function diagramToMermaid(d: Diagram): string {
  if (d.type === "sequence") {
    const alias = (n: string) => n.replace(/[^\wÀ-ÿ]/g, "_");
    return ["sequenceDiagram", ...d.participants.map((p) => `    participant ${alias(p)} as ${p}`), ...d.messages.map((m) => `    ${alias(m.from)}${m.reply ? "-->>" : "->>"}${alias(m.to)}: ${m.text.replace(/[;#]/g, " ")}`)].join("\n");
  }
  const name = (id: string) => d.classes.find((c) => c.id === id)?.name ?? "?";
  const arrow = { associacao: "--", heranca: "--|>", composicao: "*--", agregacao: "o--", dependencia: "..>" } as const;
  const lines = ["classDiagram"];
  for (const c of d.classes) {
    lines.push(`    class ${c.name} {`);
    for (const m of [...c.attributes, ...c.methods]) lines.push(`        ${m.visibility}${m.text.replace(/[{};]/g, "")}`);
    lines.push("    }");
  }
  for (const r of d.relations) {
    // Composição/agregação: o losango fica no "todo" (from).
    lines.push(r.kind === "heranca" ? `    ${name(r.to)} <|-- ${name(r.from)}${r.label ? ` : ${r.label}` : ""}` : `    ${name(r.from)} ${arrow[r.kind]} ${name(r.to)}${r.label ? ` : ${r.label}` : ""}`);
  }
  return lines.join("\n");
}

export function projectToMarkdown(p: Project): string {
  const req = (id: string) => p.requirements.find((r) => r.id === id)?.code ?? "?";
  const story = (id: string) => `H${p.stories.findIndex((s) => s.id === id) + 1}`;
  const out: string[] = [];
  out.push(`# ${p.name}`, "", p.description || "", "", `**Modelo de desenvolvimento:** ${modelInfo(p.model).name}  `, `**Etapas concluídas:** ${p.completed.length} de 6  `, `**Gerado pelo Engenho em:** ${new Date().toLocaleDateString("pt-BR")}`, "");
  out.push(`## 1. ${STEPS[0].title}`, "", "### Contexto", "", p.problem.context || "_(vazio)_", "", "### Objetivos", "", list(p.problem.objectives), "", "### Partes interessadas", "", list(p.problem.stakeholders), "", "### Escopo", "", p.problem.scope || "_(vazio)_", "", "### Fora do escopo", "", p.problem.outOfScope || "_(vazio)_", "");
  out.push(`## 2. ${STEPS[1].title}`, "", "| Código | Tipo | Requisito | Prioridade |", "| --- | --- | --- | --- |", ...p.requirements.map((r) => `| ${r.code} | ${r.kind === "funcional" ? "Funcional" : "Não funcional"} | ${r.text.replace(/\|/g, "/")} | ${PRIORITY_LABEL[r.priority]} |`), "");
  out.push(`## 3. ${STEPS[2].title}`, "");
  p.stories.forEach((s, i) => out.push(`### H${i + 1} · ${s.points} pontos`, "", `> ${storyText(s)}`, "", "**Critérios de aceitação**", "", list(s.criteria), "", `**Requisitos:** ${s.requirementIds.map(req).join(", ") || "—"}`, ""));
  out.push(`## 4. ${STEPS[3].title}`, "");
  for (const u of p.useCases) {
    out.push(`### ${u.code} · ${u.name}`, "", `**Ator:** ${u.actor}  `, `**Histórias:** ${u.storyIds.map(story).join(", ") || "—"}`, "", `**Pré-condições:** ${u.preconditions || "—"}`, "", "**Fluxo principal**", "", numbered(u.mainFlow), "");
    if (u.alternativeFlows.some((f) => f.trim())) out.push("**Fluxos alternativos**", "", list(u.alternativeFlows), "");
    out.push(`**Pós-condições:** ${u.postconditions || "—"}`, "");
  }
  if (p.useCases.length) out.push("### Diagrama de casos de uso", "", "```mermaid", ["flowchart LR", ...[...new Set(p.useCases.map((u) => u.actor || "Ator"))].map((a, i) => `    A${i}(["${a}"])`), ...p.useCases.map((u) => `    ${u.code}(("${u.name.replace(/"/g, "'")}"))`), ...p.useCases.map((u) => `    A${[...new Set(p.useCases.map((x) => x.actor || "Ator"))].indexOf(u.actor || "Ator")} --- ${u.code}`)].join("\n"), "```", "");
  out.push(`## 5. ${STEPS[4].title}`, "");
  for (const d of p.diagrams) {
    out.push(`### ${d.title}`, "", "```mermaid", diagramToMermaid(d), "```", "");
    if (d.type === "class" && d.relations.length) out.push(...d.relations.map((r) => `- ${RELATION_LABEL[r.kind]}: ${d.classes.find((c) => c.id === r.from)?.name} → ${d.classes.find((c) => c.id === r.to)?.name}${r.label ? ` (${r.label})` : ""}`), "");
  }
  out.push(`## 6. ${STEPS[5].title}`, "");
  for (const c of p.contracts) out.push(`### Operação: \`${c.operation}\``, "", `**Referência:** ${c.references}`, "", "**Pré-condições**", "", list(c.preconditions), "", "**Pós-condições**", "", list(c.postconditions), "");
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}
