"use client";


import { QuerySnapshot, DocumentData } from "firebase/firestore";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  projects: QuerySnapshot<DocumentData> | undefined;
};

const ProjectList = ({ projects }: Props) => {
  const pathname = usePathname();

  return (
    <>
      {projects?.docs.map((project) => {
        const isActive = pathname.includes(project.id);

        return (
          <Link
            href={`/project/${project.id}`}
            key={project.id}
            className={`projectRow ${
              isActive
                ? "bg-gray-700/50 text-white"
                : "text-gray-300 hover:bg-gray-500/10"
            }`}
          >
            <p className="max-w-[200px] truncate">
              {project.data()?.name || "New Project"}
            </p>
          </Link>
        );
      })}
    </>
  );
};

export default ProjectList; 