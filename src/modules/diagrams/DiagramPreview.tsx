/** Prévias ilustrativas do design (cartões do Laboratório UML). */
export function DiagramPreview({ type }: { type: string }) {
  if (type === "usecase") {
    return (
      <svg viewBox="0 0 300 130" className="diagram-svg" aria-label="Prévia de diagrama de casos de uso">
        <circle cx="42" cy="32" r="10" />
        <path d="M42 42v38M24 57h36M42 80l-16 25M42 80l16 25" />
        <rect x="88" y="12" width="192" height="108" rx="10" className="diagram-boundary" />
        <ellipse cx="175" cy="45" rx="53" ry="20" />
        <ellipse cx="175" cy="91" rx="53" ry="20" />
        <path d="M60 57h62M60 70l65 20" />
        <text x="175" y="49" textAnchor="middle">
          Criar projeto
        </text>
        <text x="175" y="95" textAnchor="middle">
          Editar diagrama
        </text>
      </svg>
    );
  }
  if (type === "sequence") {
    return (
      <svg viewBox="0 0 300 130" className="diagram-svg" aria-label="Prévia de diagrama de sequência">
        <rect x="20" y="10" width="67" height="25" rx="5" />
        <rect x="116" y="10" width="67" height="25" rx="5" />
        <rect x="213" y="10" width="67" height="25" rx="5" />
        <path strokeDasharray="4 4" d="M53 35v85M149 35v85M246 35v85" />
        <path d="M53 54h96l-7-5M149 75h97l-7-5M246 96H53l7-5" />
        <text x="53" y="27" textAnchor="middle">
          Usuário
        </text>
        <text x="149" y="27" textAnchor="middle">
          Sistema
        </text>
        <text x="246" y="27" textAnchor="middle">
          Dados
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 130" className="diagram-svg" aria-label="Prévia de diagrama de classes">
      <g transform="translate(16 22)">
        <rect width="86" height="86" rx="5" />
        <path d="M0 27h86M0 57h86" />
        <text x="43" y="18" textAnchor="middle">
          Projeto
        </text>
        <text x="8" y="46">
          + nome
        </text>
        <text x="8" y="76">
          + salvar()
        </text>
      </g>
      <g transform="translate(198 22)">
        <rect width="86" height="86" rx="5" />
        <path d="M0 27h86M0 57h86" />
        <text x="43" y="18" textAnchor="middle">
          Diagrama
        </text>
        <text x="8" y="46">
          + tipo
        </text>
        <text x="8" y="76">
          + editar()
        </text>
      </g>
      <path d="M102 65h96M185 59l13 6-13 6" />
    </svg>
  );
}
