import { DiagramEditor } from "@/modules/diagrams/DiagramEditor";

export const metadata = { title: "Editor de diagrama" };

export default async function Page({ params }: PageProps<"/diagramas/[id]">) {
  const { id } = await params;
  return <DiagramEditor id={id} />;
}
