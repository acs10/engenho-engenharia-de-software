import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/core/theme/fonts";
import { StudyProvider } from "@/modules/study/StudyProvider";
import "./globals.css";
import "./complementos.css";

export const metadata: Metadata = {
  title: { default: "Engenho — aprenda engenharia de software na prática", template: "%s | Engenho" },
  description: "Trilha prática de engenharia de software: defina o problema, escreva requisitos e histórias, modele casos de uso, crie diagramas UML e especifique contratos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body>
        <StudyProvider>{children}</StudyProvider>
      </body>
    </html>
  );
}
