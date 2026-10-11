import type { ModelId, ProblemDefinition, Project, StudyData } from "./types";

export interface Template {
  id: string;
  name: string;
  description: string;
  problem: ProblemDefinition;
}

const blankProblem = (): ProblemDefinition => ({ context: "", objectives: [""], stakeholders: [""], scope: "", outOfScope: "" });

export const TEMPLATES: Template[] = [
  {
    id: "biblioteca",
    name: "Sistema de Biblioteca",
    description: "Empréstimos, devoluções e multas da biblioteca escolar.",
    problem: {
      context: "A biblioteca da escola controla empréstimos em um caderno. Livros se perdem, ninguém sabe quem está atrasado e o inventário anual leva uma semana inteira.",
      objectives: ["Saber em tempo real quais livros estão emprestados e com quem", "Reduzir o inventário de 5 dias para 1 dia", "Cobrar atrasos antes do fim do bimestre"],
      stakeholders: ["Bibliotecária", "Alunos", "Coordenação pedagógica"],
      scope: "Cadastro de livros e alunos, empréstimos, devoluções, reservas e relatório de atrasos.",
      outOfScope: "Venda de livros e integração com o sistema financeiro da escola.",
    },
  },
  {
    id: "delivery",
    name: "App de Delivery",
    description: "Pedidos de um restaurante de bairro pelo celular.",
    problem: {
      context: "O restaurante recebe pedidos por telefone e WhatsApp, anota em papel e erra endereços. Nos horários de pico, clientes desistem por demora no atendimento.",
      objectives: ["Receber pedidos sem depender do telefone", "Diminuir erros de endereço", "Mostrar ao cliente o andamento do pedido"],
      stakeholders: ["Clientes", "Atendente", "Cozinha", "Entregadores"],
      scope: "Cardápio, carrinho, pagamento na entrega, acompanhamento do pedido e painel da cozinha.",
      outOfScope: "Programa de fidelidade e entregas fora da cidade.",
    },
  },
  {
    id: "clinica",
    name: "Agenda de Clínica",
    description: "Agendamento de consultas de uma clínica pequena.",
    problem: {
      context: "A recepção agenda consultas numa planilha compartilhada. Há horários duplicados, faltas sem aviso e pacientes que esperam muito para remarcar.",
      objectives: ["Eliminar agendamentos duplicados", "Reduzir faltas com lembretes", "Permitir remarcação pelo próprio paciente"],
      stakeholders: ["Pacientes", "Recepcionista", "Médicos"],
      scope: "Agenda por profissional, marcação, remarcação, lembretes e lista de espera.",
      outOfScope: "Prontuário eletrônico e faturamento de convênios.",
    },
  },
];

export function newProject(input: { id: string; name: string; description: string; model: ModelId; templateId?: string }): Project {
  const t = TEMPLATES.find((x) => x.id === input.templateId);
  const now = new Date().toISOString();
  return {
    id: input.id,
    name: input.name.trim(),
    description: input.description.trim(),
    model: input.model,
    createdAt: now,
    updatedAt: now,
    problem: t ? structuredClone(t.problem) : blankProblem(),
    requirements: [],
    stories: [],
    useCases: [],
    diagrams: [],
    contracts: [],
    completed: [],
    quiz: {},
    read: [],
  };
}

/** Projeto de demonstração: exatamente o estado do design (etapa 1 concluída, requisitos em andamento). */
export function demoData(): StudyData {
  const p = newProject({ id: "biblioteca", name: "Sistema de Biblioteca", description: "Empréstimos, devoluções e multas da biblioteca escolar.", model: "cascata", templateId: "biblioteca" });
  p.completed = [0];
  p.read = [0];
  p.quiz = { 0: [1, 1, 2] };
  p.requirements = [
    { id: "r1", code: "RF01", kind: "funcional", text: "O sistema deve registrar o empréstimo de um livro para um aluno cadastrado.", priority: "must" },
    { id: "r2", code: "RF02", kind: "funcional", text: "O sistema deve registrar a devolução e calcular a multa por dia de atraso.", priority: "must" },
    { id: "r3", code: "RNF01", kind: "nao-funcional", text: "O sistema deve ser rápido e fácil de usar.", priority: "should" },
  ];
  return { userName: "Estudante", currentProjectId: p.id, projects: [p] };
}
