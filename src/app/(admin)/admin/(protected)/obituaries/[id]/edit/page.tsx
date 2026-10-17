import { Suspense } from "react";
import ObituaryEditor from "@/components/admin/obituary-editor";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function ObituaryEditorContent({ params }: PageProps) {
  const { id } = await params;
  return <ObituaryEditor key={`obituary-${id}`} id={id} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <main id="main">
          <p role="status" className="text-sm text-[#647367]">
            Wczytywanie edytora nekrologu…
          </p>
        </main>
      }
    >
      <ObituaryEditorContent params={params} />
    </Suspense>
  );
}
