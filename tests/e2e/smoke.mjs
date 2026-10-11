// Passeio por todas as páginas registrando erros do navegador e rolagem lateral (celular).
// Uso: com `npx next dev -p 3011` rodando →  node tests/e2e/smoke.mjs [baseUrl]   (MOBILE=1 para celular)
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] ?? "http://localhost:3011").replace(/\/$/, "");
const ROUTES = ["/", "/projetos", "/projetos?novo=1", "/diagramas", "/diagramas?novo=1", "/diagramas/casos-de-uso", "/diagramas/inexistente", "/etapas/1", "/etapas/2", "/etapas/3", "/etapas/6", "/biblioteca", "/ajuda", "/configuracoes", "/rota-que-nao-existe"];

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
await page.setViewport(process.env.MOBILE ? { width: 375, height: 812, isMobile: true, hasTouch: true } : { width: 1366, height: 900 });
let failures = 0;
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.split("\n")[0]}`));
page.on("console", (m) => m.type() === "error" && !/favicon|Download the React DevTools|404 \(Not Found\)/.test(m.text()) && errors.push(`console: ${m.text().split("\n")[0].slice(0, 160)}`));
for (const path of ROUTES) {
  errors.length = 0;
  await page.goto(BASE + path, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 300));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const problems = [...errors, ...(overflow > 2 ? [`rolagem lateral de ${overflow}px`] : [])];
  if (problems.length) failures++;
  console.log(`${problems.length ? "❌" : "✅"} ${path}${problems.length ? ` — ${[...new Set(problems)].join(" | ")}` : ""}`);
}
await browser.close();
console.log(failures ? `\n${failures} página(s) com problema` : "\nTodas as páginas sem erro");
process.exit(failures ? 1 : 0);
