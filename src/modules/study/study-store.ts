import { makeAutoObservable } from "mobx";
import { newId } from "@/core/lib/ids";
import { modelInfo, STEPS } from "@/modules/domain/curriculum";
import { emptyDiagram, nextStep, stepMissing } from "@/modules/domain/rules";
import { demoData, newProject } from "@/modules/domain/templates";
import type { ClassMember, Contract, Diagram, DiagramType, ModelId, ProblemDefinition, Project, RelationKind, Requirement, RequirementKind, SequenceMessage, StudyData, UmlClass, UseCase, UserStory } from "@/modules/domain/types";

export type Result = string | null;
type ListKey = "objectives" | "stakeholders";

const touch = (p: Project) => {
  p.updatedAt = new Date().toISOString();
};

/** Estado do estudo. Tudo fica no navegador (sem login), salvo automaticamente. */
export class StudyStore {
  userName: string;
  currentProjectId: string | null;
  projects: Project[];

  constructor(data: StudyData = demoData()) {
    this.userName = data.userName;
    this.currentProjectId = data.currentProjectId;
    this.projects = data.projects;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get snapshot(): StudyData {
    return JSON.parse(JSON.stringify({ userName: this.userName, currentProjectId: this.currentProjectId, projects: this.projects }));
  }

  replaceAll(data: StudyData) {
    this.userName = data.userName;
    this.currentProjectId = data.currentProjectId;
    this.projects = data.projects;
  }

  resetDemo() {
    this.replaceAll(demoData());
  }

  get project(): Project | null {
    return this.projects.find((p) => p.id === this.currentProjectId) ?? this.projects[0] ?? null;
  }

  private get p(): Project {
    const p = this.project;
    if (!p) throw new Error("Nenhum projeto selecionado.");
    return p;
  }

  // ------------------------------------------------------------ projetos

  createProject(input: { name: string; description: string; model: ModelId; templateId?: string }): Result {
    if (input.name.trim().length < 3) return "Dê um nome ao projeto (mín. 3 letras).";
    if (this.projects.some((p) => p.name.trim().toLowerCase() === input.name.trim().toLowerCase())) return "Já existe um projeto com esse nome.";
    const p = newProject({ id: newId(), ...input });
    this.projects.unshift(p);
    this.currentProjectId = p.id;
    return null;
  }

  selectProject(id: string) {
    if (this.projects.some((p) => p.id === id)) this.currentProjectId = id;
  }

  updateProject(id: string, patch: { name?: string; description?: string }): Result {
    const p = this.projects.find((x) => x.id === id);
    if (!p) return "Projeto não encontrado.";
    if (patch.name !== undefined && patch.name.trim().length < 3) return "Nome muito curto.";
    if (patch.name !== undefined) p.name = patch.name.trim();
    if (patch.description !== undefined) p.description = patch.description.trim();
    touch(p);
    return null;
  }

  duplicateProject(id: string) {
    const p = this.projects.find((x) => x.id === id);
    if (!p) return;
    const copy: Project = { ...structuredClone(JSON.parse(JSON.stringify(p)) as Project), id: newId(), name: `${p.name} (cópia)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.projects.unshift(copy);
    this.currentProjectId = copy.id;
  }

  deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    if (this.currentProjectId === id) this.currentProjectId = this.projects[0]?.id ?? null;
  }

  /** Importa um projeto exportado em JSON (valida o mínimo). */
  importProject(raw: unknown): Result {
    const p = raw as Partial<Project>;
    if (!p || typeof p !== "object" || typeof p.name !== "string" || !p.problem || !Array.isArray(p.requirements)) return "Arquivo inválido: não parece um projeto do Engenho.";
    const base = newProject({ id: newId(), name: p.name, description: String(p.description ?? ""), model: (["cascata", "agil", "espiral", "prototipacao"].includes(String(p.model)) ? p.model : "cascata") as ModelId });
    const project: Project = { ...base, ...JSON.parse(JSON.stringify(p)), id: base.id, name: this.projects.some((x) => x.name === p.name) ? `${p.name} (importado)` : p.name };
    this.projects.unshift(project);
    this.currentProjectId = project.id;
    return null;
  }

  setModel(model: ModelId) {
    this.p.model = model;
    touch(this.p);
  }

  setUserName(name: string) {
    this.userName = name.trim().slice(0, 40) || "Estudante";
  }

  // ------------------------------------------------------------ progresso

  /** No cascata/espiral as etapas abrem em ordem; no ágil/prototipação, todas ficam abertas. */
  canOpen(step: number): boolean {
    const p = this.project;
    if (!p) return false;
    return !modelInfo(p.model).sequential || step <= nextStep(p);
  }

  markRead(step: number) {
    if (!this.p.read.includes(step)) this.p.read.push(step);
    touch(this.p);
  }

  answerQuiz(step: number, question: number, option: number) {
    const answers = [...(this.p.quiz[step] ?? [])];
    answers[question] = option;
    this.p.quiz[step] = answers;
    touch(this.p);
  }

  quizScore(step: number): { correct: number; total: number; answered: number } {
    const answers = this.project?.quiz[step] ?? [];
    const quiz = STEPS[step].quiz;
    return { correct: quiz.filter((q, i) => answers[i] === q.answer).length, total: quiz.length, answered: answers.filter((a) => a !== undefined && a !== null).length };
  }

  /** O que falta para concluir a etapa: leitura, prática e questionário. */
  missingFor(step: number): string[] {
    const p = this.project;
    if (!p) return ["Crie um projeto"];
    const m: string[] = [];
    if (!p.read.includes(step)) m.push("Ler o conteúdo da etapa");
    m.push(...stepMissing(p, step));
    const q = this.quizScore(step);
    if (q.correct < q.total) m.push(`Acertar o questionário (${q.correct}/${q.total})`);
    return m;
  }

  completeStep(step: number): Result {
    const p = this.p;
    if (!this.canOpen(step)) return `No ${modelInfo(p.model).name}, conclua as etapas anteriores primeiro.`;
    const missing = this.missingFor(step);
    if (missing.length) return `Ainda falta: ${missing.join(" · ")}.`;
    if (!p.completed.includes(step)) p.completed.push(step);
    p.completed.sort((a, b) => a - b);
    touch(p);
    return null;
  }

  reopenStep(step: number) {
    const p = this.p;
    // No modelo sequencial, reabrir uma etapa reabre as seguintes (voltar custa caro).
    p.completed = modelInfo(p.model).sequential ? p.completed.filter((s) => s < step) : p.completed.filter((s) => s !== step);
    touch(p);
  }

  // ------------------------------------------------------------ 1. problema

  updateProblem(patch: Partial<Pick<ProblemDefinition, "context" | "scope" | "outOfScope">>) {
    Object.assign(this.p.problem, patch);
    touch(this.p);
  }

  setProblemItem(key: ListKey, index: number, value: string) {
    this.p.problem[key][index] = value;
    touch(this.p);
  }

  addProblemItem(key: ListKey) {
    if (this.p.problem[key].length < 8) this.p.problem[key].push("");
  }

  removeProblemItem(key: ListKey, index: number) {
    this.p.problem[key].splice(index, 1);
    if (!this.p.problem[key].length) this.p.problem[key].push("");
    touch(this.p);
  }

  // ------------------------------------------------------------ 2. requisitos

  private nextCode(kind: RequirementKind) {
    const prefix = kind === "funcional" ? "RF" : "RNF";
    const max = Math.max(0, ...this.p.requirements.filter((r) => r.code.startsWith(prefix) && (kind === "funcional" ? !r.code.startsWith("RNF") : true)).map((r) => Number(r.code.replace(/\D/g, "")) || 0));
    return `${prefix}${String(max + 1).padStart(2, "0")}`;
  }

  addRequirement(kind: RequirementKind, text = ""): string {
    const r: Requirement = { id: newId(), code: this.nextCode(kind), kind, text, priority: "should" };
    this.p.requirements.push(r);
    touch(this.p);
    return r.id;
  }

  updateRequirement(id: string, patch: Partial<Pick<Requirement, "text" | "priority">>) {
    const r = this.p.requirements.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
    touch(this.p);
  }

  removeRequirement(id: string) {
    this.p.requirements = this.p.requirements.filter((r) => r.id !== id);
    for (const s of this.p.stories) s.requirementIds = s.requirementIds.filter((x) => x !== id);
    touch(this.p);
  }

  // ------------------------------------------------------------ 3. histórias

  addStory(): string {
    const s: UserStory = { id: newId(), role: "", action: "", benefit: "", criteria: [""], points: 3, requirementIds: [] };
    this.p.stories.push(s);
    touch(this.p);
    return s.id;
  }

  updateStory(id: string, patch: Partial<Pick<UserStory, "role" | "action" | "benefit" | "points">>) {
    const s = this.p.stories.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
    touch(this.p);
  }

  setCriterion(id: string, index: number, value: string) {
    const s = this.p.stories.find((x) => x.id === id);
    if (s) s.criteria[index] = value;
    touch(this.p);
  }

  addCriterion(id: string) {
    const s = this.p.stories.find((x) => x.id === id);
    if (s && s.criteria.length < 6) s.criteria.push("");
  }

  removeCriterion(id: string, index: number) {
    const s = this.p.stories.find((x) => x.id === id);
    if (!s) return;
    s.criteria.splice(index, 1);
    if (!s.criteria.length) s.criteria.push("");
    touch(this.p);
  }

  toggleStoryRequirement(id: string, requirementId: string) {
    const s = this.p.stories.find((x) => x.id === id);
    if (!s) return;
    s.requirementIds = s.requirementIds.includes(requirementId) ? s.requirementIds.filter((x) => x !== requirementId) : [...s.requirementIds, requirementId];
    touch(this.p);
  }

  removeStory(id: string) {
    this.p.stories = this.p.stories.filter((s) => s.id !== id);
    for (const u of this.p.useCases) u.storyIds = u.storyIds.filter((x) => x !== id);
    touch(this.p);
  }

  // ------------------------------------------------------------ 4. casos de uso

  addUseCase(): string {
    const n = Math.max(0, ...this.p.useCases.map((u) => Number(u.code.replace(/\D/g, "")) || 0)) + 1;
    const u: UseCase = { id: newId(), code: `UC${String(n).padStart(2, "0")}`, name: "", actor: this.p.problem.stakeholders.find((s) => s.trim()) ?? "", preconditions: "", mainFlow: ["", "", ""], alternativeFlows: [], postconditions: "", storyIds: [] };
    this.p.useCases.push(u);
    touch(this.p);
    return u.id;
  }

  updateUseCase(id: string, patch: Partial<Pick<UseCase, "name" | "actor" | "preconditions" | "postconditions">>) {
    const u = this.p.useCases.find((x) => x.id === id);
    if (u) Object.assign(u, patch);
    touch(this.p);
  }

  setFlowStep(id: string, flow: "mainFlow" | "alternativeFlows", index: number, value: string) {
    const u = this.p.useCases.find((x) => x.id === id);
    if (u) u[flow][index] = value;
    touch(this.p);
  }

  addFlowStep(id: string, flow: "mainFlow" | "alternativeFlows") {
    const u = this.p.useCases.find((x) => x.id === id);
    if (u && u[flow].length < 15) u[flow].push("");
  }

  removeFlowStep(id: string, flow: "mainFlow" | "alternativeFlows", index: number) {
    const u = this.p.useCases.find((x) => x.id === id);
    if (u) u[flow].splice(index, 1);
    touch(this.p);
  }

  toggleUseCaseStory(id: string, storyId: string) {
    const u = this.p.useCases.find((x) => x.id === id);
    if (!u) return;
    u.storyIds = u.storyIds.includes(storyId) ? u.storyIds.filter((x) => x !== storyId) : [...u.storyIds, storyId];
    touch(this.p);
  }

  removeUseCase(id: string) {
    this.p.useCases = this.p.useCases.filter((u) => u.id !== id);
    touch(this.p);
  }

  // ------------------------------------------------------------ 5. diagramas

  diagram(id: string): Diagram | undefined {
    return this.project?.diagrams.find((d) => d.id === id);
  }

  createDiagram(type: DiagramType, title: string): string {
    const d = emptyDiagram({ id: newId(), type, title: title.trim() || "Novo diagrama" });
    if (type === "sequence") d.participants = ["Usuário", "Sistema"];
    this.p.diagrams.push(d);
    touch(this.p);
    return d.id;
  }

  private d(id: string): Diagram {
    const d = this.diagram(id);
    if (!d) throw new Error("Diagrama não encontrado.");
    d.updatedAt = new Date().toISOString();
    touch(this.p);
    return d;
  }

  renameDiagram(id: string, title: string) {
    if (title.trim()) this.d(id).title = title.trim().slice(0, 60);
  }

  deleteDiagram(id: string) {
    this.p.diagrams = this.p.diagrams.filter((d) => d.id !== id);
    touch(this.p);
  }

  addClass(diagramId: string, name: string): Result {
    const d = this.d(diagramId);
    const clean = name.trim().replace(/\s+/g, "");
    if (!/^[A-ZÀ-Ý][\wÀ-ÿ]*$/.test(clean)) return "Nome de classe começa com maiúscula e não tem espaços (ex.: Emprestimo).";
    if (d.classes.some((c) => c.name.toLowerCase() === clean.toLowerCase())) return "Essa classe já existe no diagrama.";
    if (d.classes.length >= 12) return "Limite de 12 classes por diagrama.";
    d.classes.push({ id: newId(), name: clean, attributes: [], methods: [] });
    return null;
  }

  renameClass(diagramId: string, classId: string, name: string): Result {
    const d = this.d(diagramId);
    const clean = name.trim().replace(/\s+/g, "");
    if (!/^[A-ZÀ-Ý][\wÀ-ÿ]*$/.test(clean)) return "Nome de classe começa com maiúscula e não tem espaços.";
    const c = d.classes.find((x) => x.id === classId);
    if (c) c.name = clean;
    return null;
  }

  removeClass(diagramId: string, classId: string) {
    const d = this.d(diagramId);
    d.classes = d.classes.filter((c) => c.id !== classId);
    d.relations = d.relations.filter((r) => r.from !== classId && r.to !== classId);
  }

  addMember(diagramId: string, classId: string, kind: "attributes" | "methods", text: string): Result {
    const c = this.d(diagramId).classes.find((x) => x.id === classId);
    if (!c) return "Classe não encontrada.";
    const t = text.trim();
    if (!t) return "Escreva o membro (ex.: nome: String).";
    if (kind === "methods" && !/\(.*\)/.test(t)) return "Métodos levam parênteses: salvar() ou calcularMulta(dias: int): float.";
    const member: ClassMember = { id: newId(), visibility: kind === "methods" ? "+" : "-", text: t.slice(0, 60) };
    c[kind].push(member);
    return null;
  }

  updateMember(diagramId: string, classId: string, kind: "attributes" | "methods", memberId: string, patch: Partial<Pick<ClassMember, "text" | "visibility">>) {
    const m = this.d(diagramId).classes.find((x) => x.id === classId)?.[kind].find((x) => x.id === memberId);
    if (m) Object.assign(m, patch);
  }

  removeMember(diagramId: string, classId: string, kind: "attributes" | "methods", memberId: string) {
    const c = this.d(diagramId).classes.find((x) => x.id === classId);
    if (c) c[kind] = c[kind].filter((m) => m.id !== memberId);
  }

  addRelation(diagramId: string, from: string, to: string, kind: RelationKind, label = ""): Result {
    const d = this.d(diagramId);
    if (!from || !to) return "Escolha as duas classes.";
    if (from === to && kind === "heranca") return "Uma classe não herda dela mesma.";
    if (d.relations.some((r) => r.from === from && r.to === to && r.kind === kind)) return "Esse relacionamento já existe.";
    d.relations.push({ id: newId(), from, to, kind, label: label.trim().slice(0, 30) });
    return null;
  }

  removeRelation(diagramId: string, relationId: string) {
    const d = this.d(diagramId);
    d.relations = d.relations.filter((r) => r.id !== relationId);
  }

  addParticipant(diagramId: string, name: string): Result {
    const d = this.d(diagramId);
    const n = name.trim().slice(0, 24);
    if (!n) return "Dê um nome ao participante.";
    if (d.participants.includes(n)) return "Esse participante já existe.";
    if (d.participants.length >= 6) return "Limite de 6 participantes.";
    d.participants.push(n);
    return null;
  }

  removeParticipant(diagramId: string, name: string) {
    const d = this.d(diagramId);
    d.participants = d.participants.filter((p) => p !== name);
    d.messages = d.messages.filter((m) => m.from !== name && m.to !== name);
  }

  addMessage(diagramId: string, input: Omit<SequenceMessage, "id">): Result {
    const d = this.d(diagramId);
    if (!d.participants.includes(input.from) || !d.participants.includes(input.to)) return "Escolha os participantes.";
    if (!input.text.trim()) return "Escreva a mensagem (ex.: buscarLivro(codigo)).";
    if (d.messages.length >= 20) return "Limite de 20 mensagens.";
    d.messages.push({ id: newId(), ...input, text: input.text.trim().slice(0, 40) });
    return null;
  }

  moveMessage(diagramId: string, messageId: string, delta: -1 | 1) {
    const d = this.d(diagramId);
    const i = d.messages.findIndex((m) => m.id === messageId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= d.messages.length) return;
    [d.messages[i], d.messages[j]] = [d.messages[j], d.messages[i]];
  }

  removeMessage(diagramId: string, messageId: string) {
    const d = this.d(diagramId);
    d.messages = d.messages.filter((m) => m.id !== messageId);
  }

  // ------------------------------------------------------------ 6. contratos

  addContract(operation = ""): string {
    const c: Contract = { id: newId(), operation, references: this.p.useCases[0]?.code ?? "", preconditions: [""], postconditions: ["", ""] };
    this.p.contracts.push(c);
    touch(this.p);
    return c.id;
  }

  updateContract(id: string, patch: Partial<Pick<Contract, "operation" | "references">>) {
    const c = this.p.contracts.find((x) => x.id === id);
    if (c) Object.assign(c, patch);
    touch(this.p);
  }

  setCondition(id: string, list: "preconditions" | "postconditions", index: number, value: string) {
    const c = this.p.contracts.find((x) => x.id === id);
    if (c) c[list][index] = value;
    touch(this.p);
  }

  addCondition(id: string, list: "preconditions" | "postconditions") {
    const c = this.p.contracts.find((x) => x.id === id);
    if (c && c[list].length < 8) c[list].push("");
  }

  removeCondition(id: string, list: "preconditions" | "postconditions", index: number) {
    const c = this.p.contracts.find((x) => x.id === id);
    if (c) c[list].splice(index, 1);
    touch(this.p);
  }

  removeContract(id: string) {
    this.p.contracts = this.p.contracts.filter((c) => c.id !== id);
    touch(this.p);
  }

  /** Operações sugeridas para contratos: mensagens dos diagramas de sequência e métodos das classes. */
  get suggestedOperations(): string[] {
    const p = this.project;
    if (!p) return [];
    const ops = new Set<string>();
    for (const d of p.diagrams) {
      for (const m of d.messages) if (!m.reply && /\(.*\)/.test(m.text)) ops.add(m.text);
      for (const c of d.classes) for (const m of c.methods) ops.add(m.text.replace(/:\s*[\w<>[\]]+\s*$/, "").trim());
    }
    const used = new Set(p.contracts.map((c) => c.operation.trim()));
    return [...ops].filter((o) => !used.has(o)).slice(0, 8);
  }
}

export type { UmlClass };
