"use client";

import { Icon } from "./Icon";

/** Lista de frases editável (objetivos, critérios, passos de fluxo, condições…). */
export function ListEditor({ items, onChange, onAdd, onRemove, placeholder, addLabel, numbered = false, label }: { items: string[]; onChange: (index: number, value: string) => void; onAdd: () => void; onRemove: (index: number) => void; placeholder: string; addLabel: string; numbered?: boolean; label: string }) {
  return (
    <div className="list-editor">
      {items.map((item, i) => (
        <div className="list-row" key={i}>
          {numbered && <span className="row-num">{i + 1}.</span>}
          <input className="input" value={item} placeholder={placeholder} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(i, e.target.value)} />
          <button type="button" className="icon-btn danger" onClick={() => onRemove(i)} aria-label={`Remover ${label.toLowerCase()} ${i + 1}`}>
            <Icon name="x" size={15} />
          </button>
        </div>
      ))}
      <button type="button" className="text-button add-row" onClick={onAdd}>
        <Icon name="plus" size={15} /> {addLabel}
      </button>
    </div>
  );
}
