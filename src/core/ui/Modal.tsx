"use client";

import { useEffect, type ReactNode } from "react";

/** Janela central com fundo escurecido; fecha com Esc ou clicando fora. */
export function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
