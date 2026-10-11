import { notFound } from "next/navigation";
import { STEPS } from "@/modules/domain/curriculum";
import { StepPage } from "@/modules/steps/StepPage";

export async function generateMetadata({ params }: PageProps<"/etapas/[n]">) {
  const n = Number((await params).n);
  return { title: STEPS[n - 1] ? `Etapa ${n} · ${STEPS[n - 1].title}` : "Etapa" };
}

export default async function Page({ params }: PageProps<"/etapas/[n]">) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1 || n > 6) notFound();
  return <StepPage index={n - 1} />;
}
