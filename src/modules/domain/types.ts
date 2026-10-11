/**
 * Engenho — estudo prático de engenharia de software.
 * O aluno desenvolve UM projeto passando pelas 6 etapas do processo: cada etapa produz um artefato
 * (problema, requisitos, histórias, casos de uso, diagramas, contratos) que alimenta a seguinte.
 */

export type ModelId = "cascata" | "agil" | "espiral" | "prototipacao";

export type Priority = "must" | "should" | "could" | "wont";
export type RequirementKind = "funcional" | "nao-funcional";

export interface Requirement {
  id: string;
  /** "RF01", "RNF01" */
  code: string;
  kind: RequirementKind;
  text: string;
  priority: Priority;
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  /** Critérios de aceitação ("Dado… quando… então…" ou frases simples) */
  criteria: string[];
  /** Pontos de esforço (sequência de Fibonacci) */
  points: number;
  requirementIds: string[];
}

export interface UseCase {
  id: string;
  /** "UC01" */
  code: string;
  name: string;
  actor: string;
  preconditions: string;
  mainFlow: string[];
  alternativeFlows: string[];
  postconditions: string;
  storyIds: string[];
}

export type Visibility = "+" | "-" | "#";
export interface ClassMember {
  id: string;
  visibility: Visibility;
  text: string;
}
export interface UmlClass {
  id: string;
  name: string;
  attributes: ClassMember[];
  methods: ClassMember[];
}
export type RelationKind = "associacao" | "heranca" | "composicao" | "agregacao" | "dependencia";
export interface UmlRelation {
  id: string;
  from: string;
  to: string;
  kind: RelationKind;
  label: string;
}
export interface SequenceMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  reply: boolean;
}

export type DiagramType = "class" | "usecase" | "sequence";
export interface Diagram {
  id: string;
  type: DiagramType;
  title: string;
  updatedAt: string;
  /** Diagrama de classes */
  classes: UmlClass[];
  relations: UmlRelation[];
  /** Diagrama de sequência */
  participants: string[];
  messages: SequenceMessage[];
}

export interface Contract {
  id: string;
  operation: string;
  references: string;
  preconditions: string[];
  postconditions: string[];
}

export interface ProblemDefinition {
  context: string;
  objectives: string[];
  stakeholders: string[];
  scope: string;
  outOfScope: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  model: ModelId;
  createdAt: string;
  updatedAt: string;
  problem: ProblemDefinition;
  requirements: Requirement[];
  stories: UserStory[];
  useCases: UseCase[];
  diagrams: Diagram[];
  contracts: Contract[];
  /** Etapas concluídas (índices 0–5) */
  completed: number[];
  /** Respostas dos questionários: etapa → índice da alternativa escolhida por pergunta */
  quiz: Record<number, number[]>;
  /** Leitura da etapa marcada como feita */
  read: number[];
}

export interface StudyData {
  userName: string;
  currentProjectId: string | null;
  projects: Project[];
}

export const STEP_COUNT = 6;
