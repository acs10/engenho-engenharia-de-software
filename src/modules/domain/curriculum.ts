import type { ModelId } from "./types";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface LessonSection {
  title: string;
  body: string;
  /** Exemplo aplicado ao projeto (opcional) */
  example?: string;
}

export interface StepInfo {
  title: string;
  subtitle: string;
  /** Texto de apresentação da etapa (cartão escuro do design) */
  intro: string;
  minutes: number;
  /** Rótulo da folha ilustrada do design */
  paperTitle: string;
  tag: string;
  lesson: LessonSection[];
  /** O que é preciso para concluir a etapa */
  goal: string;
  quiz: QuizQuestion[];
}

export const STEPS: StepInfo[] = [
  {
    title: "Definição do problema",
    subtitle: "Entenda o contexto e os objetivos",
    intro: "Antes de pensar em telas ou código, entenda quem sofre com o problema, o que precisa mudar e até onde o sistema vai. Um problema bem definido evita construir a coisa certa do jeito errado — ou a coisa errada muito bem feita.",
    minutes: 20,
    paperTitle: "Visão do problema",
    tag: "contexto + objetivo",
    goal: "Descreva o contexto (mín. 40 caracteres), ao menos 1 objetivo, 1 parte interessada e o escopo.",
    lesson: [
      { title: "Por que começar pelo problema", body: "A maior parte dos projetos que falham não erra no código: erra no entendimento. Descrever o problema obriga a conversar com quem vai usar o sistema e transforma impressões vagas em fatos." },
      { title: "Contexto", body: "Explique a situação atual em poucas frases: quem está envolvido, como o trabalho é feito hoje e qual é a dor principal.", example: "A biblioteca da escola controla empréstimos em um caderno. Livros se perdem, ninguém sabe quem está atrasado e o inventário leva uma semana." },
      { title: "Objetivos e partes interessadas", body: "Objetivos dizem o que deve melhorar (de preferência mensurável). Partes interessadas (stakeholders) são todos que ganham ou perdem com o sistema: usuários, gestores, equipe técnica." },
      { title: "Escopo e fora do escopo", body: "Deixar claro o que NÃO será feito é tão importante quanto o que será. Isso protege o projeto do “já que você está aí, faz também…”." },
    ],
    quiz: [
      { question: "Qual destas frases descreve melhor um OBJETIVO?", options: ["Usar React e Firebase", "Reduzir o tempo do inventário de 5 dias para 1", "Criar uma tela bonita", "Ter um botão de login"], answer: 1, explanation: "Objetivos falam do resultado esperado para o negócio, de preferência de forma mensurável — não da tecnologia nem das telas." },
      { question: "Por que registrar o que está FORA do escopo?", options: ["Para deixar o documento maior", "Para evitar que o projeto cresça sem controle", "Porque o professor pede", "Não é necessário"], answer: 1, explanation: "Fora do escopo alinha expectativas e evita o crescimento descontrolado de funcionalidades (scope creep)." },
      { question: "Quem é uma parte interessada (stakeholder)?", options: ["Só quem programa o sistema", "Só o cliente que paga", "Todos que são afetados pelo sistema", "Apenas o usuário final"], answer: 2, explanation: "Stakeholder é qualquer pessoa ou grupo afetado pelo sistema: usuários, gestores, suporte, quem paga e quem mantém." },
    ],
  },
  {
    title: "Requisitos",
    subtitle: "Liste e priorize os requisitos",
    intro: "Transforme as necessidades do projeto em requisitos claros, verificáveis e priorizados. Eles serão a base para tudo o que vem depois.",
    minutes: 25,
    paperTitle: "Requisitos do sistema",
    tag: "clareza + prioridade",
    goal: "Cadastre ao menos 3 requisitos funcionais e 1 não funcional, todos priorizados e sem termos vagos.",
    lesson: [
      { title: "Funcionais × não funcionais", body: "Requisitos funcionais dizem O QUE o sistema faz (registrar empréstimo, emitir multa). Não funcionais dizem COMO ele deve ser (desempenho, segurança, usabilidade, disponibilidade)." },
      { title: "Requisito bom é verificável", body: "Evite palavras como “rápido”, “fácil”, “amigável”, “etc.”. Prefira algo que possa ser testado.", example: "Ruim: “O sistema deve ser rápido.” Bom: “A busca de livros deve responder em até 2 segundos com 10 mil títulos.”" },
      { title: "Priorização MoSCoW", body: "Must (obrigatório), Should (importante), Could (desejável) e Won’t (não agora). Priorizar ajuda a decidir o que entra primeiro quando o tempo acaba — e ele sempre acaba." },
      { title: "Identificação", body: "Numere cada requisito (RF01, RNF01). Os códigos serão usados para rastrear quais histórias, casos de uso e testes atendem cada requisito." },
    ],
    quiz: [
      { question: "“O sistema deve ter uma interface amigável.” O que há de errado?", options: ["Nada, está ótimo", "Não é verificável: “amigável” é subjetivo", "Deveria ser funcional", "Falta a prioridade Must"], answer: 1, explanation: "Não dá para testar “amigável”. Reescreva com um critério mensurável, como “um usuário novo conclui um empréstimo em até 3 passos”." },
      { question: "“O sistema deve registrar a devolução de um livro” é um requisito…", options: ["Não funcional", "Funcional", "De negócio", "Opcional"], answer: 1, explanation: "Descreve um comportamento do sistema, então é funcional." },
      { question: "Na técnica MoSCoW, “Won’t” significa…", options: ["Nunca será feito", "Não será feito nesta entrega", "É um erro", "É obrigatório"], answer: 1, explanation: "Won’t (this time) registra algo combinado como fora desta entrega — pode voltar no futuro." },
    ],
  },
  {
    title: "User stories",
    subtitle: "Descreva as necessidades dos usuários",
    intro: "Histórias de usuário colocam as pessoas no centro: quem quer, o que quer e por quê. Com critérios de aceitação, cada história vira algo que dá para entregar e testar.",
    minutes: 25,
    paperTitle: "Backlog do produto",
    tag: "papel + valor",
    goal: "Escreva ao menos 3 histórias completas (papel, ação, benefício), cada uma com 1 critério de aceitação e ligada a um requisito.",
    lesson: [
      { title: "O formato", body: "Como [papel], quero [ação], para [benefício]. O “para” é o mais esquecido — e o mais importante, porque explica o valor.", example: "Como bibliotecária, quero ver os empréstimos atrasados, para cobrar os alunos antes do fim do bimestre." },
      { title: "Critérios de aceitação", body: "Dizem quando a história está pronta. Um formato útil é Dado/Quando/Então: “Dado um empréstimo vencido, quando abro o painel, então ele aparece em vermelho no topo.”" },
      { title: "INVEST", body: "Boas histórias são Independentes, Negociáveis, Valiosas, Estimáveis, pequenas (Small) e Testáveis." },
      { title: "Estimativa em pontos", body: "Pontos medem esforço relativo, não horas. Use a sequência 1, 2, 3, 5, 8, 13: se passou de 13, quebre a história." },
    ],
    quiz: [
      { question: "Qual parte da história explica o VALOR?", options: ["Como [papel]", "Quero [ação]", "Para [benefício]", "Os pontos"], answer: 2, explanation: "O benefício (“para…”) mostra por que a funcionalidade importa." },
      { question: "Uma história estimada em 21 pontos deve…", options: ["Ser feita primeiro", "Ser quebrada em histórias menores", "Ser descartada", "Virar requisito não funcional"], answer: 1, explanation: "Histórias grandes demais (épicos) são difíceis de estimar e entregar — divida-as." },
      { question: "Critérios de aceitação servem para…", options: ["Enfeitar a história", "Definir quando a história está pronta", "Escolher a linguagem de programação", "Calcular o preço"], answer: 1, explanation: "Eles tornam a história testável e evitam discussões sobre o que é “pronto”." },
    ],
  },
  {
    title: "Casos de uso",
    subtitle: "Modele as interações do sistema",
    intro: "Casos de uso detalham, passo a passo, como um ator interage com o sistema para alcançar um objetivo — incluindo o que acontece quando algo dá errado.",
    minutes: 30,
    paperTitle: "Especificação de caso de uso",
    tag: "ator + fluxo",
    goal: "Especifique ao menos 2 casos de uso com ator, fluxo principal (3+ passos) e pós-condição.",
    lesson: [
      { title: "Atores", body: "Ator é quem (ou o que) interage com o sistema de fora: pessoas, outros sistemas, dispositivos. Um mesmo usuário pode atuar em papéis diferentes." },
      { title: "Fluxo principal", body: "O “caminho feliz”: a sequência de passos em que tudo dá certo. Alterne ator e sistema: “1. O aluno informa o código do livro. 2. O sistema mostra a disponibilidade…”." },
      { title: "Fluxos alternativos e exceções", body: "O que muda quando o livro está emprestado? Quando o aluno tem multa? Fluxos alternativos são onde moram os bugs que ninguém previu." },
      { title: "Pré e pós-condições", body: "Pré-condição: o que precisa ser verdade antes (aluno cadastrado). Pós-condição: o que fica garantido depois (empréstimo registrado e livro indisponível)." },
    ],
    quiz: [
      { question: "O que é um ator?", options: ["Uma classe do sistema", "Algo externo que interage com o sistema", "Uma tela", "Um banco de dados interno"], answer: 1, explanation: "Ator é externo ao sistema: pessoa, outro sistema ou dispositivo." },
      { question: "“O livro está emprestado para outra pessoa” entra em…", options: ["Fluxo principal", "Fluxo alternativo/exceção", "Pós-condição", "Requisito não funcional"], answer: 1, explanation: "É um desvio do caminho feliz, então é um fluxo alternativo." },
      { question: "Uma pós-condição descreve…", options: ["O que deve ser verdade antes", "O que fica garantido ao final", "O nome do ator", "A tela inicial"], answer: 1, explanation: "Pós-condição é o estado garantido ao final do caso de uso." },
    ],
  },
  {
    title: "Diagramas UML",
    subtitle: "Represente a estrutura e o comportamento",
    intro: "Diagramas mostram o sistema de ângulos diferentes: a estrutura (classes) e o comportamento (sequência). Use-os para pensar — e para explicar para outras pessoas.",
    minutes: 35,
    paperTitle: "Modelo do domínio",
    tag: "estrutura + comportamento",
    goal: "Crie um diagrama de classes com ao menos 2 classes e 1 relacionamento, e um diagrama de sequência com 2+ mensagens.",
    lesson: [
      { title: "Diagrama de classes", body: "Mostra as classes, seus atributos e métodos, e como se relacionam. Comece pelos substantivos dos casos de uso: Aluno, Livro, Empréstimo." },
      { title: "Relacionamentos", body: "Associação (usa), herança (é um), composição (é parte de e não vive sem), agregação (é parte de mas vive sozinho) e dependência (usa de passagem)." },
      { title: "Diagrama de sequência", body: "Mostra a troca de mensagens ao longo do tempo para realizar um caso de uso. Cada linha vertical é um participante; cada seta, uma mensagem." },
      { title: "Diagrama de casos de uso", body: "Resume atores e funcionalidades num desenho só. No Engenho, ele é gerado automaticamente a partir dos seus casos de uso." },
    ],
    quiz: [
      { question: "“Professor é um Usuário” é um relacionamento de…", options: ["Composição", "Herança", "Dependência", "Associação"], answer: 1, explanation: "“É um” indica herança (generalização)." },
      { question: "Qual diagrama mostra a ordem das mensagens no tempo?", options: ["Classes", "Casos de uso", "Sequência", "Implantação"], answer: 2, explanation: "O diagrama de sequência ordena as mensagens de cima para baixo no tempo." },
      { question: "“Pedido e seus Itens: o item não existe sem o pedido.” Isso é…", options: ["Agregação", "Composição", "Herança", "Dependência"], answer: 1, explanation: "Composição: a parte não vive sem o todo." },
    ],
  },
  {
    title: "Contratos e especificações",
    subtitle: "Detalhe as operações internas",
    intro: "Contratos de operação descrevem o que muda no sistema quando uma operação é executada: o que precisa ser verdade antes e o que fica garantido depois. É a ponte entre o modelo e o código.",
    minutes: 25,
    paperTitle: "Contrato de operação",
    tag: "pré + pós-condições",
    goal: "Escreva ao menos 2 contratos com referência ao caso de uso, 1 pré-condição e 2 pós-condições.",
    lesson: [
      { title: "O que é um contrato", body: "Para cada operação importante (ex.: registrarEmprestimo), descreva as mudanças de estado: objetos criados, atributos alterados, associações formadas ou desfeitas." },
      { title: "Pré-condições", body: "O que o sistema assume antes da operação: “existe um Aluno com a matrícula informada”, “o Livro está disponível”." },
      { title: "Pós-condições", body: "Escritas no passado, descrevem o resultado: “um Empréstimo foi criado”, “o Livro passou a indisponível”, “o Empréstimo foi associado ao Aluno”.", example: "Operação: registrarEmprestimo(matricula, codigoLivro) · Referência: UC01" },
      { title: "Da especificação ao código", body: "Pré-condições viram validações; pós-condições viram testes automatizados. Um contrato bem escrito é meio caminho andado para o teste unitário." },
    ],
    quiz: [
      { question: "Pós-condições costumam ser escritas…", options: ["No futuro", "No passado (o que foi feito)", "Como perguntas", "Em código"], answer: 1, explanation: "Descrevem o estado resultante: “um Empréstimo foi criado”." },
      { question: "“O livro está disponível” é melhor como…", options: ["Pré-condição", "Pós-condição", "Ator", "Requisito não funcional"], answer: 0, explanation: "É algo que precisa ser verdade antes de emprestar." },
      { question: "Pós-condições ajudam diretamente a escrever…", options: ["O CSS", "Os testes automatizados", "O nome do projeto", "O contrato de trabalho"], answer: 1, explanation: "Cada pós-condição vira uma verificação de teste." },
    ],
  },
];

export interface ModelInfo {
  id: ModelId;
  name: string;
  estimate: string;
  /** As etapas precisam ser concluídas em ordem? */
  sequential: boolean;
  summary: string;
  /** Dica exibida na etapa atual */
  tip: string;
}

export const MODELS: ModelInfo[] = [
  { id: "cascata", name: "Modelo em Cascata", estimate: "4–6 horas", sequential: true, summary: "Uma etapa de cada vez: só se avança quando a anterior está concluída e aprovada.", tip: "No modelo em cascata, as etapas são liberadas em ordem. Capriche: voltar custa caro." },
  { id: "agil", name: "Desenvolvimento Ágil", estimate: "3–5 horas", sequential: false, summary: "Ciclos curtos e entrega contínua: histórias guiam o trabalho e tudo pode ser revisto.", tip: "No ágil, comece pelas histórias e volte às etapas anteriores sempre que aprender algo novo." },
  { id: "espiral", name: "Modelo Espiral", estimate: "5–7 horas", sequential: true, summary: "Cada volta da espiral passa por planejamento, análise de riscos, engenharia e avaliação.", tip: "No espiral, anote em cada etapa o maior risco do projeto e como reduzi-lo." },
  { id: "prototipacao", name: "Prototipação", estimate: "3–4 horas", sequential: false, summary: "Protótipos rápidos ajudam a descobrir o que o usuário realmente quer antes de detalhar.", tip: "Na prototipação, valide as histórias com um rascunho de tela antes de detalhar os casos de uso." },
];

export const modelInfo = (id: ModelId) => MODELS.find((m) => m.id === id) ?? MODELS[0];

export const PRIORITY_LABEL = { must: "Must · obrigatório", should: "Should · importante", could: "Could · desejável", wont: "Won’t · não agora" } as const;
export const RELATION_LABEL = { associacao: "Associação", heranca: "Herança", composicao: "Composição", agregacao: "Agregação", dependencia: "Dependência" } as const;
export const DIAGRAM_LABEL = { class: "Diagrama de classes", usecase: "Diagrama de casos de uso", sequence: "Diagrama de sequência" } as const;
export const FIBONACCI = [1, 2, 3, 5, 8, 13];

/** Glossário da Biblioteca. */
export const GLOSSARY: { term: string; definition: string }[] = [
  { term: "Ator", definition: "Pessoa, sistema ou dispositivo externo que interage com o sistema." },
  { term: "Backlog", definition: "Lista priorizada de tudo o que se pretende construir no produto." },
  { term: "Caso de uso", definition: "Descrição passo a passo de como um ator usa o sistema para alcançar um objetivo." },
  { term: "Composição", definition: "Relação todo-parte em que a parte não existe sem o todo." },
  { term: "Contrato de operação", definition: "Especificação das pré e pós-condições de uma operação do sistema." },
  { term: "Critério de aceitação", definition: "Condição que precisa ser atendida para a história ser considerada pronta." },
  { term: "Escopo", definition: "Limites do que o projeto vai e não vai entregar." },
  { term: "Herança", definition: "Relação “é um” entre uma classe geral e uma especializada." },
  { term: "INVEST", definition: "Checklist de boas histórias: Independente, Negociável, Valiosa, Estimável, Pequena, Testável." },
  { term: "MoSCoW", definition: "Técnica de priorização: Must, Should, Could, Won’t." },
  { term: "Pós-condição", definition: "Estado garantido ao final de uma operação ou caso de uso." },
  { term: "Pré-condição", definition: "O que precisa ser verdade antes de uma operação ou caso de uso." },
  { term: "Rastreabilidade", definition: "Capacidade de ligar requisitos a histórias, casos de uso, código e testes." },
  { term: "Requisito funcional", definition: "O que o sistema deve fazer." },
  { term: "Requisito não funcional", definition: "Como o sistema deve ser: desempenho, segurança, usabilidade…" },
  { term: "Stakeholder", definition: "Qualquer pessoa ou grupo afetado pelo sistema." },
  { term: "UML", definition: "Linguagem de modelagem unificada: notação padrão para diagramas de software." },
  { term: "User story", definition: "Necessidade descrita do ponto de vista do usuário: papel, ação e benefício." },
];
