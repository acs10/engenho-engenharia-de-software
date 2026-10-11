import { describe, expect, it } from "vitest";
import { STEPS } from "@/modules/domain/curriculum";
import { diagramToMermaid, projectToMarkdown } from "@/modules/domain/export";
import { contractIssues, requirementIssues, stepMissing, storyIssues, suggestClasses, useCaseIssues } from "@/modules/domain/rules";
import { demoData } from "@/modules/domain/templates";
import { StudyStore } from "@/modules/study/study-store";

const fresh = () => new StudyStore(demoData());
/** Responde certo o questionário e marca a leitura da etapa. */
const study = (s: StudyStore, step: number) => {
  s.markRead(step);
  STEPS[step].quiz.forEach((q, i) => s.answerQuiz(step, i, q.answer));
};

describe("UT-01 corretor de requisitos", () => {
  it("aponta termos vagos, texto curto e falta de “deve”", () => {
    expect(requirementIssues({ kind: "nao-funcional", text: "O sistema deve ser rápido e fácil de usar." }).join(" ")).toMatch(/rapido|facil/);
    expect(requirementIssues({ kind: "funcional", text: "Login" }).length).toBeGreaterThan(0);
    expect(requirementIssues({ kind: "funcional", text: "Cadastrar livros com título e autor" }).join(" ")).toContain("O sistema deve");
  });
  it("aceita requisito claro e verificável", () => {
    expect(requirementIssues({ kind: "funcional", text: "O sistema deve registrar o empréstimo de um livro para um aluno." })).toEqual([]);
    expect(requirementIssues({ kind: "nao-funcional", text: "O sistema deve responder à busca em até 2 segundos." })).toEqual([]);
  });
  it("não confunde palavras que só contêm um termo vago (ex.: “bom” em “bombeiro”)", () => {
    expect(requirementIssues({ kind: "funcional", text: "O sistema deve cadastrar o bombeiro responsável." })).toEqual([]);
  });
});

describe("UT-02 histórias, casos de uso e contratos", () => {
  it("história completa precisa de papel, ação, benefício, critério e requisito", () => {
    const base = { id: "s", role: "aluno", action: "reservar um livro", benefit: "ser avisado na devolução", criteria: ["Recebo aviso"], points: 3, requirementIds: ["r1"] };
    expect(storyIssues(base)).toEqual([]);
    expect(storyIssues({ ...base, benefit: "" }).join(" ")).toContain("benefício");
    expect(storyIssues({ ...base, points: 21 }).join(" ")).toContain("13 pontos");
    expect(storyIssues({ ...base, requirementIds: [] }).join(" ")).toContain("rastreabilidade");
  });
  it("caso de uso exige ator, 3 passos e pós-condição", () => {
    const u = { id: "u", code: "UC01", name: "Registrar empréstimo", actor: "Bibliotecária", preconditions: "", mainFlow: ["a", "b", "c"], alternativeFlows: [], postconditions: "Empréstimo registrado", storyIds: [] };
    expect(useCaseIssues(u)).toEqual([]);
    expect(useCaseIssues({ ...u, mainFlow: ["a", "", ""] }).join(" ")).toContain("3 passos");
  });
  it("contrato: operação como chamada, referência, 1 pré e 2 pós-condições", () => {
    const c = { id: "c", operation: "registrarEmprestimo(matricula, codigo)", references: "UC01", preconditions: ["Aluno existe"], postconditions: ["Empréstimo criado", "Livro indisponível"] };
    expect(contractIssues(c)).toEqual([]);
    expect(contractIssues({ ...c, operation: "registrar emprestimo" }).length).toBe(1);
    expect(contractIssues({ ...c, postconditions: ["só uma"] }).length).toBe(1);
  });
});

describe("UT-03 trilha e modelos de processo", () => {
  it("demonstração = estado do design: etapa 1 concluída, requisitos em andamento", () => {
    const s = fresh();
    expect(s.project?.completed).toEqual([0]);
    expect(stepMissing(s.project!, 1).join(" ")).toMatch(/3 requisitos funcionais|alertas/);
  });
  it("cascata: etapas abrem em ordem; ágil: todas abertas", () => {
    const s = fresh();
    expect(s.canOpen(1)).toBe(true);
    expect(s.canOpen(3)).toBe(false);
    s.setModel("agil");
    expect(s.canOpen(5)).toBe(true);
  });
  it("só conclui com leitura + prática + questionário certo", () => {
    const s = fresh();
    expect(s.completeStep(1)).toMatch(/Ler o conteúdo/);
    s.updateRequirement("r3", { text: "O sistema deve responder à busca em até 2 segundos." });
    s.addRequirement("funcional", "O sistema deve permitir reservar um livro emprestado.");
    s.markRead(1);
    s.answerQuiz(1, 0, 0); // errada
    expect(s.completeStep(1)).toMatch(/questionário/);
    study(s, 1);
    expect(s.completeStep(1)).toBeNull();
    expect(s.project?.completed).toEqual([0, 1]);
    expect(s.canOpen(2)).toBe(true);
  });
  it("cascata: reabrir uma etapa reabre as seguintes", () => {
    const s = fresh();
    s.project!.completed = [0, 1, 2];
    s.reopenStep(1);
    expect(s.project?.completed).toEqual([0]);
  });
});

describe("UT-04 diagramas", () => {
  it("classes: nome válido, sem duplicata, métodos com parênteses", () => {
    const s = fresh();
    const d = s.createDiagram("class", "Domínio");
    expect(s.addClass(d, "Livro")).toBeNull();
    expect(s.addClass(d, "livro")).toMatch(/maiúscula/);
    expect(s.addClass(d, "Livro")).toMatch(/já existe/);
    const c = s.diagram(d)!.classes[0].id;
    expect(s.addMember(d, c, "methods", "emprestar")).toMatch(/parênteses/);
    expect(s.addMember(d, c, "methods", "emprestar(aluno): void")).toBeNull();
  });
  it("relacionamentos e Mermaid (herança e composição no lado certo)", () => {
    const s = fresh();
    const d = s.createDiagram("class", "Domínio");
    for (const n of ["Usuario", "Aluno", "Pedido", "Item"]) s.addClass(d, n);
    const [usuario, aluno, pedido, item] = s.diagram(d)!.classes.map((c) => c.id);
    expect(s.addRelation(d, aluno, usuario, "heranca")).toBeNull();
    expect(s.addRelation(d, aluno, usuario, "heranca")).toMatch(/já existe/);
    expect(s.addRelation(d, pedido, item, "composicao", "1..*")).toBeNull();
    const m = diagramToMermaid(s.diagram(d)!);
    expect(m).toContain("Usuario <|-- Aluno");
    expect(m).toContain("Pedido *-- Item : 1..*");
    s.removeClass(d, item);
    expect(s.diagram(d)!.relations).toHaveLength(1);
  });
  it("sequência: mensagens só entre participantes e reordenáveis", () => {
    const s = fresh();
    const d = s.createDiagram("sequence", "Empréstimo");
    expect(s.addMessage(d, { from: "Usuário", to: "Fantasma", text: "x()", reply: false })).toMatch(/participantes/);
    s.addMessage(d, { from: "Usuário", to: "Sistema", text: "buscar(codigo)", reply: false });
    s.addMessage(d, { from: "Sistema", to: "Usuário", text: "livro", reply: true });
    const [a, b] = s.diagram(d)!.messages;
    s.moveMessage(d, b.id, -1);
    expect(s.diagram(d)!.messages.map((x) => x.id)).toEqual([b.id, a.id]);
    expect(diagramToMermaid(s.diagram(d)!)).toContain("Sistema-->>Usuário: livro");
  });
  it("sugere classes pelos substantivos, sem verbos do início da frase", () => {
    const s = fresh();
    const u = s.addUseCase();
    s.updateUseCase(u, { name: "Registrar empréstimo" });
    s.setFlowStep(u, "mainFlow", 0, "A bibliotecária informa a matrícula do Aluno");
    s.setFlowStep(u, "mainFlow", 1, "O sistema localiza o Livro");
    const sug = suggestClasses(s.project!);
    expect(sug).toContain("Aluno");
    expect(sug).toContain("Livro");
    expect(sug).not.toContain("Registrar");
  });
  it("operações dos diagramas viram sugestões de contrato", () => {
    const s = fresh();
    const d = s.createDiagram("sequence", "Seq");
    s.addMessage(d, { from: "Usuário", to: "Sistema", text: "registrarEmprestimo(m, c)", reply: false });
    expect(s.suggestedOperations).toContain("registrarEmprestimo(m, c)");
    s.addContract("registrarEmprestimo(m, c)");
    expect(s.suggestedOperations).not.toContain("registrarEmprestimo(m, c)");
  });
});

describe("UT-05 projetos e exportação", () => {
  it("cria pelo modelo, impede nome repetido, duplica e exclui", () => {
    const s = fresh();
    expect(s.createProject({ name: "Sistema de Biblioteca", description: "", model: "agil" })).toMatch(/Já existe/);
    expect(s.createProject({ name: "Delivery", description: "", model: "agil", templateId: "delivery" })).toBeNull();
    expect(s.project?.problem.stakeholders).toContain("Entregadores");
    s.duplicateProject(s.project!.id);
    expect(s.projects).toHaveLength(3);
    s.deleteProject(s.project!.id);
    expect(s.projects).toHaveLength(2);
  });
  it("importa um projeto exportado e recusa arquivo estranho", () => {
    const s = fresh();
    const json = JSON.parse(JSON.stringify(s.project));
    expect(s.importProject(json)).toBeNull();
    expect(s.projects[0].name).toBe("Sistema de Biblioteca (importado)");
    expect(s.importProject({ foo: 1 })).toMatch(/inválido/);
  });
  it("documento Markdown traz todas as etapas e os diagramas em Mermaid", () => {
    const s = fresh();
    s.createDiagram("class", "Domínio");
    const md = projectToMarkdown(s.project!);
    for (const t of ["## 1. Definição do problema", "## 2. Requisitos", "| RF01 |", "## 5. Diagramas UML", "```mermaid", "classDiagram"]) expect(md).toContain(t);
  });
});
