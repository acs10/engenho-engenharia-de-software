// Fluxo completo com navegador real (Chrome + puppeteer-core): um aluno percorre as 6 etapas do projeto.
// Uso: com `npx next dev -p 3011` rodando →  node tests/e2e/flows.mjs [baseUrl] [pastaDeCapturas]
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] ?? "http://localhost:3011").replace(/\/$/, "");
const OUT = process.argv[3];
if (OUT) mkdirSync(OUT, { recursive: true });
const results = [];
const assert = (c, msg) => { if (!c) throw new Error(msg); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
// O design usa rolagem suave; o robô precisa da instantânea para clicar no lugar certo.
await page.evaluateOnNewDocument(() => document.addEventListener("DOMContentLoaded", () => {
  const st = document.createElement("style");
  st.textContent = "html{scroll-behavior:auto!important}";
  document.head.appendChild(st);
}));
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));
page.on("dialog", (d) => void d.accept());
if (process.env.DEBUG) page.on("pageerror", (e) => console.log("   [pageerror]", page.url(), e.message.slice(0, 1800)));

async function step(id, title, fn) {
  try { const d = await fn(); results.push(true); console.log(`✅ ${id} ${title}${d ? ` — ${d}` : ""}`); }
  catch (e) { results.push(false); console.log(`❌ ${id} ${title} — ${e.message.split("\n")[0]}`); if (OUT) await page.screenshot({ path: `${OUT}/falha-${id}.png` }); }
}
const text = () => page.evaluate(() => document.body.innerText);
const go = async (p) => { await page.goto(BASE + p, { waitUntil: "networkidle0" }); await sleep(300); };
const shot = async (name) => {
  if (!OUT) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 82 });
};
async function click(label, tag = "*[self::button or self::a]") {
  const els = await page.$$(`xpath/.//${tag}[contains(normalize-space(.), ${JSON.stringify(label)})]`);
  for (const el of els) if (await el.evaluate((n) => n.getClientRects().length > 0 && !n.disabled)) { await el.evaluate((n) => n.scrollIntoView({ block: "center" })); await el.click(); await sleep(250); return; }
  throw new Error(`não achei "${label}"`);
}
const byLabel = (label) => page.$(`[aria-label=${JSON.stringify(label)}]`);
async function type(label, value) {
  const el = await byLabel(label);
  assert(el, `campo "${label}" não encontrado`);
  await el.evaluate((n) => n.scrollIntoView({ block: "center" }));
  await el.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await el.type(value);
}
async function lastOf(prefix) {
  const els = await page.$$(`[aria-label^=${JSON.stringify(prefix)}]`);
  return els[els.length - 1];
}
async function typeLast(prefix, value) {
  const el = await lastOf(prefix);
  assert(el, `campo "${prefix}…" não encontrado`);
  await el.evaluate((n) => n.scrollIntoView({ block: "center" }));
  await el.click({ clickCount: 3 });
  await el.type(value);
}
/** Responde o questionário com as alternativas certas (índices). */
async function quiz(answers) {
  await click("Questionário", "button[@role='tab']");
  for (let q = 0; q < answers.length; q++) {
    const opts = await page.$$(`[aria-label="Pergunta ${q + 1}"] button`);
    await opts[answers[q]].click();
    await sleep(120);
  }
}
async function readAndPractice() {
  await click("Conteúdo", "button[@role='tab']");
  await click("Marcar como lido");
  await sleep(200);
}
async function conclude() {
  await click("Concluir etapa");
  await sleep(600);
}

// Começa do zero (demonstração).
await go("/");
await page.evaluate(() => localStorage.clear());

await step("F-01", "visão geral do design com o projeto de demonstração", async () => {
  await go("/");
  const t = await text();
  assert(t.includes("1 de 6 etapas concluídas") && t.includes("17%") && t.includes("Sistema de Biblioteca"), "estado inicial diferente do design");
  const locked = await page.$$(".step-number svg");
  await shot("01-visao-geral");
  return `1/6 etapas, 17%, ${locked.length} ícones (check/cadeado) na trilha`;
});

await step("F-02", "cascata bloqueia etapas futuras", async () => {
  await go("/etapas/4");
  const t = await text();
  assert(t.includes("Etapa 4 ainda bloqueada") && t.includes("Modelo em Cascata"), "etapa 4 deveria estar bloqueada");
  return "etapa 4 bloqueada até concluir a 2 e a 3";
});

await step("F-03", "etapa 2: corretor de requisitos, questionário e conclusão", async () => {
  await go("/etapas/2");
  await readAndPractice();
  let t = await text();
  assert(t.includes("Termo vago"), "o corretor deveria apontar o RNF01 vago");
  await type("Texto do requisito RNF01", "O sistema deve responder à busca de livros em até 2 segundos com 10 mil títulos.");
  await click("Requisito funcional");
  await typeLast("Texto do requisito RF", "O sistema deve permitir reservar um livro emprestado e avisar quando ele for devolvido.");
  await sleep(300);
  t = await text();
  assert(!t.includes("Termo vago"), "ainda há termo vago");
  await quiz([1, 1, 1]);
  await shot("02-questionario");
  await conclude();
  await page.waitForFunction(() => location.pathname === "/etapas/3", { timeout: 8000 });
  return "RNF01 reescrito sem termos vagos; RF03 criado; 3/3 no questionário";
});

await step("F-04", "etapa 3: três histórias completas e rastreadas", async () => {
  await readAndPractice();
  const stories = [
    ["bibliotecária", "registrar o empréstimo de um livro", "saber com quem cada livro está", "Dado um aluno sem multa, quando registro, então o livro fica indisponível"],
    ["bibliotecária", "ver os empréstimos atrasados", "cobrar antes do fim do bimestre", "Atrasados aparecem no topo da lista"],
    ["aluno", "reservar um livro emprestado", "ser avisado quando ele voltar", "Recebo aviso quando o livro é devolvido"],
  ];
  for (let i = 0; i < stories.length; i++) {
    await click("Nova história");
    const n = i + 1;
    await type(`Papel H${n}`, stories[i][0]);
    await type(`Ação H${n}`, stories[i][1]);
    await type(`Benefício H${n}`, stories[i][2]);
    await typeLast("Critério", stories[i][3]);
    const chip = (await page.$$(".story-card"))[i];
    const reqChips = await chip.$$(".chip");
    await reqChips[i % reqChips.length].click();
    await sleep(150);
  }
  await quiz([2, 1, 1]);
  await shot("03-historias");
  await conclude();
  await page.waitForFunction(() => location.pathname === "/etapas/4", { timeout: 8000 });
  return "3 histórias no formato Como/quero/para, com critério e requisito ligado";
});

await step("F-05", "etapa 4: casos de uso e diagrama gerado", async () => {
  await readAndPractice();
  const ucs = [
    ["Registrar empréstimo", "Bibliotecária", ["A bibliotecária informa a matrícula do Aluno", "O sistema valida se o Aluno não tem multa", "A bibliotecária informa o código do Livro", "O sistema registra o Empréstimo"], "Empréstimo registrado e Livro indisponível"],
    ["Reservar livro", "Alunos", ["O aluno busca o Livro", "O sistema mostra que está emprestado", "O aluno confirma a Reserva"], "Reserva registrada na fila do Livro"],
  ];
  for (let i = 0; i < ucs.length; i++) {
    await click("Novo caso de uso");
    const code = `UC0${i + 1}`;
    await type(`Nome ${code}`, ucs[i][0]);
    await type(`Ator ${code}`, ucs[i][1]);
    for (let s = 0; s < ucs[i][2].length; s++) {
      if (s >= 3) await click("Adicionar passo");
      await type(`Passo de ${code} ${s + 1}`, ucs[i][2][s]);
    }
    await type(`Pós-condições ${code}`, ucs[i][3]);
  }
  const ellipses = await page.$$eval(".uml-svg ellipse", (n) => n.length);
  assert(ellipses === 2, `diagrama de casos de uso com ${ellipses} elipses`);
  await quiz([1, 1, 1]);
  await shot("04-casos-de-uso");
  await conclude();
  await page.waitForFunction(() => location.pathname === "/etapas/5", { timeout: 8000 });
  return "UC01 e UC02 especificados; diagrama gerado com 2 elipses e 2 atores";
});

await step("F-06", "etapa 5: editor de diagrama de classes", async () => {
  await readAndPractice();
  await click("Criar");
  await page.waitForFunction(() => location.pathname.startsWith("/diagramas/"), { timeout: 8000 });
  const diagramUrl = page.url();
  for (const c of ["Aluno", "Livro", "Emprestimo"]) { await type("Nome da nova classe", c); await page.keyboard.press("Enter"); await sleep(150); }
  await type("Novo atributo de Aluno", "matricula: String"); await page.keyboard.press("Enter");
  await type("Novo atributo de Livro", "titulo: String"); await page.keyboard.press("Enter");
  await type("Novo método de Emprestimo", "calcularMulta(): float"); await page.keyboard.press("Enter");
  await sleep(200);
  const selects = await page.$$("select[aria-label='Classe A'], select[aria-label='Classe B']");
  const ids = await page.$$eval("select[aria-label='Classe A'] option", (o) => o.map((x) => x.value).filter(Boolean));
  await selects[0].select(ids[2]);
  await selects[1].select(ids[1]);
  await page.select("select[aria-label='Tipo de relacionamento']", "associacao");
  await type("Rótulo (opcional)", "1..*");
  await click("Ligar");
  await sleep(300);
  const boxes = await page.$$eval(".canvas .uml-svg .uml-class-name", (n) => n.map((x) => x.textContent));
  assert(boxes.length === 3, `${boxes.length} classes desenhadas`);
  const lines = await page.$$eval(".canvas .uml-svg line", (n) => n.length);
  await click("Código Mermaid");
  const code = await page.$eval(".mermaid-box", (n) => n.textContent);
  assert(code.includes("classDiagram") && code.includes("Emprestimo -- Livro : 1..*"), "Mermaid incorreto");
  await shot("05-diagrama-classes");
  return `${boxes.join(", ")} + relacionamento (${lines} linhas); Mermaid gerado · ${diagramUrl.split("/").pop()}`;
});

await step("F-07", "etapa 5: diagrama de sequência e conclusão", async () => {
  await go("/etapas/5");
  await click("Prática no projeto", "button[@role='tab']");
  const createButtons = await page.$$("xpath/.//button[contains(normalize-space(.), 'Criar')]");
  await createButtons[1].click();
  await page.waitForFunction(() => location.pathname.startsWith("/diagramas/"), { timeout: 8000 });
  await type("Novo participante", "BancoDeDados"); await page.keyboard.press("Enter"); await sleep(150);
  await page.select("select[aria-label='De']", "Usuário");
  await page.select("select[aria-label='Para']", "Sistema");
  await type("Mensagem", "registrarEmprestimo(matricula, codigo)"); await page.keyboard.press("Enter"); await sleep(150);
  await page.select("select[aria-label='De']", "Sistema");
  await page.select("select[aria-label='Para']", "BancoDeDados");
  await type("Mensagem", "salvar(emprestimo)"); await page.keyboard.press("Enter"); await sleep(150);
  const arrows = await page.$$eval(".canvas .uml-svg text.uml-label", (n) => n.map((x) => x.textContent));
  assert(arrows.length === 2, `${arrows.length} mensagens desenhadas`);
  await shot("06-diagrama-sequencia");
  await go("/etapas/5");
  await quiz([1, 2, 1]);
  await conclude();
  await page.waitForFunction(() => location.pathname === "/etapas/6", { timeout: 8000 });
  return arrows.join(" · ");
});

await step("F-08", "etapa 6: contratos a partir das operações dos diagramas", async () => {
  await readAndPractice();
  await click("registrarEmprestimo(matricula, codigo)");
  await click("calcularMulta()");
  const cards = await page.$$(".contract-card");
  assert(cards.length === 2, `${cards.length} contratos`);
  for (let i = 0; i < 2; i++) {
    const card = cards[i];
    await card.$eval("select[aria-label='Referência']", (s) => s.scrollIntoView({ block: "center" }));
    const sel = await card.$("select[aria-label='Referência']");
    await sel.select("UC01");
    const pre = await card.$("[aria-label='Pré-condição 1']");
    await pre.type("Existe um Aluno com a matrícula informada");
    const post1 = await card.$("[aria-label='Pós-condição 1']");
    await post1.type("Um Empréstimo foi criado");
    const post2 = await card.$("[aria-label='Pós-condição 2']");
    await post2.type("O Livro passou a indisponível");
  }
  await quiz([1, 0, 1]);
  await conclude();
  await go("/");
  const t = await text();
  assert(t.includes("6 de 6 etapas concluídas") && t.includes("100%"), "projeto deveria estar 100%");
  await shot("07-concluido");
  return "2 contratos completos · trilha 6/6 (100%)";
});

await step("F-09", "projetos: novo projeto pelo modelo e dados salvos ao recarregar", async () => {
  await go("/projetos");
  await click("Novo projeto");
  await click("App de Delivery", "button");
  await page.select(".modal select", "agil");
  await click("Criar projeto");
  await page.waitForFunction(() => location.pathname === "/etapas/1", { timeout: 8000 });
  await go("/etapas/5");
  assert(!(await text()).includes("bloqueada"), "no ágil a etapa 5 deveria estar aberta");
  await page.reload({ waitUntil: "networkidle0" });
  await go("/projetos");
  const t = await text();
  assert(t.includes("App de Delivery") && t.includes("Sistema de Biblioteca") && t.includes("6/6 etapas"), "projetos não persistiram");
  await shot("08-projetos");
  return "Delivery (Ágil) criado com etapas livres; Biblioteca 6/6 mantida após recarregar";
});

await browser.close();
const ok = results.filter(Boolean).length;
console.log(`\nResultado: ${ok}/${results.length} fluxos aprovados${errors.length ? ` · erros de página: ${[...new Set(errors)].join(" | ")}` : ""}`);
process.exit(ok === results.length && !errors.length ? 0 : 1);
