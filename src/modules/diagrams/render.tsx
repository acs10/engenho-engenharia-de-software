import type { Diagram, Project, RelationKind, UmlClass } from "@/modules/domain/types";

/**
 * Desenho dos diagramas UML em SVG, calculado a partir dos dados (sem arrastar e soltar):
 * o aluno se concentra no MODELO; o layout é automático.
 */

const BOX_W = 190;
const LINE_H = 17;
const HEAD_H = 30;
const GAP_X = 90;
const GAP_Y = 70;
const PAD = 30;

const boxHeight = (c: UmlClass) => HEAD_H + Math.max(1, c.attributes.length) * LINE_H + 10 + Math.max(1, c.methods.length) * LINE_H + 10;
const memberText = (v: string, t: string) => `${v} ${t}`;

/** Posições em grade: colunas = raiz da quantidade de classes. */
export function classLayout(d: Diagram) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(d.classes.length)));
  const rows: UmlClass[][] = [];
  d.classes.forEach((c, i) => (rows[Math.floor(i / cols)] ??= []).push(c));
  const pos = new Map<string, { x: number; y: number; w: number; h: number }>();
  let y = PAD;
  for (const row of rows) {
    const h = Math.max(...row.map(boxHeight));
    row.forEach((c, i) => pos.set(c.id, { x: PAD + i * (BOX_W + GAP_X), y, w: BOX_W, h: boxHeight(c) }));
    y += h + GAP_Y;
  }
  const width = PAD * 2 + cols * BOX_W + (cols - 1) * GAP_X;
  const height = Math.max(160, y - GAP_Y + PAD);
  return { pos, width, height };
}

/** Ponto onde a linha entre os centros cruza a borda da caixa. */
function edgePoint(b: { x: number; y: number; w: number; h: number }, tx: number, ty: number) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (!dx && !dy) return { x: cx, y: cy };
  const s = Math.min(Math.abs(b.w / 2 / (dx || 1e-9)), Math.abs(b.h / 2 / (dy || 1e-9)));
  return { x: cx + dx * s, y: cy + dy * s };
}

const MARKER: Record<RelationKind, { start?: string; end?: string; dashed?: boolean }> = {
  associacao: {},
  heranca: { end: "url(#m-heranca)" },
  composicao: { start: "url(#m-composicao)" },
  agregacao: { start: "url(#m-agregacao)" },
  dependencia: { end: "url(#m-dependencia)", dashed: true },
};

function Markers() {
  return (
    <defs>
      <marker id="m-heranca" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" orient="auto-start-reverse">
        <path d="M1 1 13 7 1 13Z" fill="#fff" stroke="#4a4256" strokeWidth="1.3" />
      </marker>
      <marker id="m-composicao" viewBox="0 0 18 12" refX="1" refY="6" markerWidth="18" markerHeight="12" orient="auto-start-reverse">
        <path d="M1 6 9 1 17 6 9 11Z" fill="#4a4256" stroke="#4a4256" />
      </marker>
      <marker id="m-agregacao" viewBox="0 0 18 12" refX="1" refY="6" markerWidth="18" markerHeight="12" orient="auto-start-reverse">
        <path d="M1 6 9 1 17 6 9 11Z" fill="#fff" stroke="#4a4256" strokeWidth="1.2" />
      </marker>
      <marker id="m-dependencia" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
        <path d="M1 1 11 6 1 11" fill="none" stroke="#4a4256" strokeWidth="1.3" />
      </marker>
      <marker id="m-seta" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
        <path d="M1 1 11 6 1 11Z" fill="#4a4256" />
      </marker>
      <marker id="m-seta-aberta" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
        <path d="M1 1 11 6 1 11" fill="none" stroke="#4a4256" strokeWidth="1.3" />
      </marker>
    </defs>
  );
}

export function ClassDiagramSvg({ diagram, id }: { diagram: Diagram; id?: string }) {
  if (!diagram.classes.length) return <EmptyCanvas text="Adicione a primeira classe ao lado para começar a desenhar." />;
  const { pos, width, height } = classLayout(diagram);
  return (
    <svg id={id} className="uml-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`Diagrama de classes: ${diagram.title}`} xmlns="http://www.w3.org/2000/svg">
      <Markers />
      <rect width={width} height={height} fill="#fffdfa" />
      {diagram.relations.map((r) => {
        const a = pos.get(r.from);
        const b = pos.get(r.to);
        if (!a || !b) return null;
        const p1 = edgePoint(a, b.x + b.w / 2, b.y + b.h / 2);
        const p2 = edgePoint(b, a.x + a.w / 2, a.y + a.h / 2);
        const m = MARKER[r.kind];
        if (r.from === r.to) {
          // Auto-relacionamento: laço no canto superior direito.
          const x = a.x + a.w;
          const y = a.y + 12;
          return (
            <g key={r.id}>
              <path d={`M${x - 30} ${a.y} C ${x - 30} ${y - 50}, ${x + 50} ${y - 20}, ${x} ${y + 10}`} fill="none" stroke="#4a4256" strokeWidth="1.3" />
              {r.label && <text x={x + 14} y={a.y - 14} className="uml-label">{r.label}</text>}
            </g>
          );
        }
        return (
          <g key={r.id}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#4a4256" strokeWidth="1.3" strokeDasharray={m.dashed ? "6 4" : undefined} markerStart={m.start} markerEnd={m.end} />
            {r.label && (
              <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6} textAnchor="middle" className="uml-label">
                {r.label}
              </text>
            )}
          </g>
        );
      })}
      {diagram.classes.map((c) => {
        const b = pos.get(c.id)!;
        const attrsH = Math.max(1, c.attributes.length) * LINE_H + 10;
        return (
          <g key={c.id} transform={`translate(${b.x} ${b.y})`}>
            <rect width={b.w} height={b.h} rx="6" fill="#fff" stroke="#4a4256" strokeWidth="1.3" />
            <rect width={b.w} height={HEAD_H} rx="6" fill="#eee9fb" stroke="#4a4256" strokeWidth="1.3" />
            <rect y={HEAD_H - 6} width={b.w} height="6" fill="#eee9fb" />
            <line x1="0" y1={HEAD_H} x2={b.w} y2={HEAD_H} stroke="#4a4256" strokeWidth="1.3" />
            <text x={b.w / 2} y={20} textAnchor="middle" className="uml-class-name">
              {c.name}
            </text>
            {c.attributes.length ? c.attributes.map((m, i) => <text key={m.id} x="10" y={HEAD_H + 17 + i * LINE_H} className="uml-member">{memberText(m.visibility, m.text)}</text>) : <text x="10" y={HEAD_H + 17} className="uml-member uml-muted">sem atributos</text>}
            <line x1="0" y1={HEAD_H + attrsH} x2={b.w} y2={HEAD_H + attrsH} stroke="#4a4256" strokeWidth="1" />
            {c.methods.length ? c.methods.map((m, i) => <text key={m.id} x="10" y={HEAD_H + attrsH + 17 + i * LINE_H} className="uml-member">{memberText(m.visibility, m.text)}</text>) : <text x="10" y={HEAD_H + attrsH + 17} className="uml-member uml-muted">sem métodos</text>}
          </g>
        );
      })}
    </svg>
  );
}

export function SequenceDiagramSvg({ diagram, id }: { diagram: Diagram; id?: string }) {
  const parts = diagram.participants;
  if (!parts.length) return <EmptyCanvas text="Adicione participantes (ex.: Aluno, Sistema, Banco) para começar." />;
  const colW = 170;
  const width = PAD * 2 + parts.length * colW;
  const top = 64;
  const step = 46;
  const height = top + Math.max(2, diagram.messages.length) * step + 50;
  const cx = (name: string) => PAD + parts.indexOf(name) * colW + colW / 2;
  return (
    <svg id={id} className="uml-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`Diagrama de sequência: ${diagram.title}`} xmlns="http://www.w3.org/2000/svg">
      <Markers />
      <rect width={width} height={height} fill="#fffdfa" />
      {parts.map((p) => (
        <g key={p}>
          <line x1={cx(p)} y1={top - 10} x2={cx(p)} y2={height - 16} stroke="#9a92a3" strokeDasharray="5 5" />
          <rect x={cx(p) - 66} y={PAD - 10} width="132" height="34" rx="6" fill="#eee9fb" stroke="#4a4256" strokeWidth="1.3" />
          <text x={cx(p)} y={PAD + 12} textAnchor="middle" className="uml-class-name">
            {p}
          </text>
        </g>
      ))}
      {diagram.messages.map((m, i) => {
        const y = top + 20 + i * step;
        const x1 = cx(m.from);
        const x2 = cx(m.to);
        if (m.from === m.to) {
          return (
            <g key={m.id}>
              <path d={`M${x1} ${y} h40 v18 h-38`} fill="none" stroke="#4a4256" strokeWidth="1.3" markerEnd="url(#m-seta)" />
              <text x={x1 + 46} y={y + 4} className="uml-label">{`${i + 1}. ${m.text}`}</text>
            </g>
          );
        }
        return (
          <g key={m.id}>
            <line x1={x1} y1={y} x2={x2 + (x2 > x1 ? -2 : 2)} y2={y} stroke="#4a4256" strokeWidth="1.3" strokeDasharray={m.reply ? "6 4" : undefined} markerEnd={m.reply ? "url(#m-seta-aberta)" : "url(#m-seta)"} />
            <text x={(x1 + x2) / 2} y={y - 7} textAnchor="middle" className="uml-label">{`${i + 1}. ${m.text}`}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Diagrama de casos de uso gerado a partir dos casos de uso do projeto (etapa 4). */
export function UseCaseDiagramSvg({ project, id }: { project: Project; id?: string }) {
  const cases = project.useCases.filter((u) => u.name.trim());
  if (!cases.length) return <EmptyCanvas text="Este diagrama é gerado a partir dos casos de uso da etapa 4. Especifique um caso de uso para vê-lo aqui." />;
  const actors = [...new Set(cases.map((u) => u.actor.trim() || "Ator"))];
  const ellH = 46;
  const gap = 18;
  const sysTop = 40;
  const sysH = Math.max(cases.length * (ellH + gap) + gap + 30, actors.length * 110 + 20);
  const height = sysTop + sysH + 30;
  const width = 620;
  const sysX = 190;
  const sysW = 390;
  const ucY = (i: number) => sysTop + 40 + i * (ellH + gap) + ellH / 2;
  const actorY = (i: number) => sysTop + 30 + i * ((sysH - 60) / Math.max(1, actors.length)) + 40;
  return (
    <svg id={id} className="uml-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`Diagrama de casos de uso: ${project.name}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={width} height={height} fill="#fffdfa" />
      <rect x={sysX} y={sysTop} width={sysW} height={sysH} rx="10" fill="none" stroke="#4a4256" strokeDasharray="6 4" />
      <text x={sysX + sysW / 2} y={sysTop + 22} textAnchor="middle" className="uml-class-name">
        {project.name}
      </text>
      {cases.map((u, i) => {
        const a = actors.indexOf(u.actor.trim() || "Ator");
        return <line key={`l${u.id}`} x1={70} y1={actorY(a) + 6} x2={sysX + 40} y2={ucY(i)} stroke="#4a4256" strokeWidth="1.2" />;
      })}
      {actors.map((a, i) => {
        const y = actorY(i);
        return (
          <g key={a} transform={`translate(52 ${y - 40})`} stroke="#4a4256" strokeWidth="1.4" fill="#fff">
            <circle cx="18" cy="10" r="9" />
            <path d="M18 19v24M4 28h28M18 43 6 62M18 43l12 19" fill="none" />
            <text x="18" y="80" textAnchor="middle" className="uml-label" stroke="none">
              {a}
            </text>
          </g>
        );
      })}
      {cases.map((u, i) => (
        <g key={u.id}>
          <ellipse cx={sysX + sysW / 2 + 10} cy={ucY(i)} rx="150" ry={ellH / 2} fill="#fff" stroke="#4a4256" strokeWidth="1.3" />
          <text x={sysX + sysW / 2 + 10} y={ucY(i) + 4} textAnchor="middle" className="uml-member">
            {`${u.code} · ${u.name.length > 34 ? `${u.name.slice(0, 33)}…` : u.name}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

function EmptyCanvas({ text }: { text: string }) {
  return (
    <div className="uml-empty">
      <p>{text}</p>
    </div>
  );
}

/** Baixa o SVG desenhado (para usar em trabalhos e apresentações). */
export function downloadSvg(elementId: string, fileName: string) {
  const el = document.getElementById(elementId);
  if (!el) return false;
  const css = "<style>.uml-class-name{font:700 13px 'DM Sans',sans-serif;fill:#201c2b}.uml-member{font:12px 'DM Sans',sans-serif;fill:#3b3442}.uml-muted{fill:#a49dab;font-style:italic}.uml-label{font:600 11px 'DM Sans',sans-serif;fill:#6346c3}</style>";
  const source = new XMLSerializer().serializeToString(el).replace(/^<svg([^>]*)>/, (m) => `${m}${css}`);
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.replace(/[^\w-]+/g, "-").toLowerCase()}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
