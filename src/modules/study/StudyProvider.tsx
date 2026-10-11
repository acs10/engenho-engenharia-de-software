"use client";

import { reaction } from "mobx";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import "@/core/state/mobx";
import type { StudyData } from "@/modules/domain/types";
import { StudyStore } from "./study-store";

/** Sem login: o estudo fica salvo neste navegador (com exportação/importação em arquivo). */
export const STORAGE_KEY = "engenho:v1";

const Ctx = createContext<StudyStore | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new StudyStore());
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as StudyData;
        if (Array.isArray(data.projects)) store.replaceAll(data);
      }
    } catch {
      // dados corrompidos: segue com a demonstração
    }
    setReady(true);
    const save = (json = JSON.stringify(store.snapshot)) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, json);
      } catch {
        // sem armazenamento (modo anônimo cheio): segue em memória
      }
    };
    const dispose = reaction(() => JSON.stringify(store.snapshot), save, { delay: 300 });
    // Fechar ou recarregar a página dentro do intervalo acima não pode perder a última alteração.
    const flush = () => save();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      dispose();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [store]);
  return (
    <Ctx.Provider value={store}>
      <div data-ready={ready ? "1" : "0"}>{children}</div>
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: 10, fontFamily: "var(--font-dm-sans)", fontSize: 13 } }} />
    </Ctx.Provider>
  );
}

export function useStudy(): StudyStore {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStudy precisa estar dentro de <StudyProvider>.");
  return s;
}
