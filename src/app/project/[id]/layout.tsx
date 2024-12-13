import ProjectHeader from "@/components/ProjectHeader";
import { Suspense } from "react";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-[#212121] pt-16">
      <ProjectHeader projectId={params.id} />
      <Suspense fallback={<div>Loading...</div>}>
        <main className="mx-auto ">
          {children}
        </main>
      </Suspense>
    </div>
  );
} 