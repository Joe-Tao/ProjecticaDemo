'use client'

import React from "react";
import { useParams } from "next/navigation";
import ProjectPlan from "@/components/ProjectPlan";
import TaskList from "@/components/TaskList";

export default function ListPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-6 flex flex-row gap-6">
        <ProjectPlan projectId={projectId} />
        <TaskList projectId={projectId} />
      </div>
    </div>
  );
}