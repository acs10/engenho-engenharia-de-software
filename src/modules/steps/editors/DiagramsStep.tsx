"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { observer } from "@/core/state/mobx";
import { Icon } from "@/core/ui/Icon";
import { DIAGRAM_LABEL } from "@/modules/domain/curriculum";
import { ClassDiagramSvg, SequenceDiagramSvg } from "@/modules/diagrams/render";
import { useStudy } from "@/modules/study/StudyProvider";

/** Etapa 5 — os diagramas do projeto (o editor completo fica no Laboratório UML). */
export const DiagramsStep = observer(function DiagramsStep() {
  const store = useStudy();
  const router = useRouter();
  const p = store.project!;
  const classes = p.diagrams.filter((d) => d.type === "class");
  const sequences = p.diagrams.filter((d) => d.type === "sequence");
  const create = (type: "class" | "sequence") => {
    const title = type === "class" ? `Modelo de domínio — ${p.name}` : `Sequência — ${p.useCases[0]?.name || "caso de uso principal"}`;
    router.push(`/diagramas/${store.createDiagram(type, title)}`);
  };
  const section = (type: "class" | "sequence", list: typeof classes, hint: string) => (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>{DIAGRAM_LABEL[type]}</h3>
          <p>{hint}</p>
        </div>
        <button className="secondary-button" onClick={() => create(type)}>
          <Icon name="plus" size={16} /> Criar
        </button>
      </div>
      {list.length ? (
        <div className="grid-2">
          {list.map((d) => (
            <Link key={d.id} href={`/diagramas/${d.id}`} className="diagram-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="diagram-preview">
                <div className="diagram-mini">{type === "class" ? <ClassDiagramSvg diagram={d} /> : <SequenceDiagramSvg diagram={d} />}</div>
              </div>
              <div className="diagram-info">
                <span className="diagram-icon">
                  <Icon name="diagram" size={18} />
                </span>
                <div>
                  <h3>{d.title}</h3>
                  <p>{type === "class" ? `${d.classes.length} classes · ${d.relations.length} relacionamentos` : `${d.participants.length} participantes · ${d.messages.length} mensagens`}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="hint">Nenhum diagrama ainda.</p>
      )}
    </div>
  );
  return (
    <div>
      {section("class", classes, "Comece pelos substantivos dos casos de uso: eles costumam virar classes.")}
      {section("sequence", sequences, "Escolha um caso de uso e mostre as mensagens trocadas para realizá-lo.")}
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Diagrama de casos de uso</h3>
            <p>Gerado automaticamente a partir da etapa 4 — {p.useCases.length} caso(s) de uso.</p>
          </div>
          <Link className="secondary-button" href="/diagramas/casos-de-uso">
            Ver diagrama <Icon name="chevron" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
});
