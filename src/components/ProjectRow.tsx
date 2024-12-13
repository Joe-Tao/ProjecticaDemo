"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { db } from "@/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, deleteDoc, doc, orderBy, query, getDoc } from "firebase/firestore";
import Link from "next/link";
import { IoChatboxOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import ProjectOptions from "./ProjectOptions";

interface Props {
    id: string;
    index: number;
  }

  
const ProjectRow = ({ id }: Props) => {
    const pathname = usePathname();
    const router = useRouter();
    const {data: session} = useSession();
    const [active, setActive] = useState(false);
    const [projectName, setProjectName] = useState<string>("");

    const [messages, loading] = useCollection(
        query(
            collection(
                db, 
                "users", 
                session?.user?.email as string, 
                "projects", 
                id, 
                "messages"
            )
        )
    );

    useEffect(() => {
        if(!pathname) return;
        setActive(pathname.includes(id));
    }, [pathname, id]);

    const [projectsSnapshot] = useCollection(
        query(
            collection(
                db, 
                "users", 
                session?.user?.email as string, 
                "projects"
            ),
            orderBy("createdAt", "desc")
        )
    );

    useEffect(() => {
        const fetchProjectName = async () => {
            if (!session?.user?.email) return;
            
            const projectDoc = await getDoc(
                doc(db, "users", session.user.email, "projects", id)
            );
            
            if (projectDoc.exists() && projectDoc.data().name) {
                setProjectName(projectDoc.data().name);
            }
        };

        fetchProjectName();
    }, [id, session?.user?.email]);

    const handleRemoveProject = async () => {
        await deleteDoc(
            doc(
                db, 
                "users", 
                session?.user?.email as string, 
                "projects", 
                id
            )
        );
        
        if(active) {
            const nextProject = projectsSnapshot?.docs?.find((chat) => chat.id !== id);
            if(nextProject) {
                router.push(`/project/${nextProject.id}`);
            } else {
                router.push("/");
            }
        }

        
    };

    const handleNameUpdate = (newName: string) => {
        setProjectName(newName);
    };

    const project = 
            messages?.docs[messages?.docs?.length - 1]?.data().text &&
            messages?.docs[messages?.docs?.length - 1]?.data();

    const projectText = projectName || project?.text || "New Project";
    const shouldAnimate = active

  return (
    <Link
      href={`/project/${id}`}
      className={`flex gap-2 items-center justify-center px-2 py-1.5 hover:bg-white/10 rounded-md mb-2 duration-300 ease-in ${
        active ? "bg-white/10" : "bg-transparent"
      }`}
    >
      <IoChatboxOutline />
      <div className="relative flex-1 select-none overflow-hidden text-ellipsis break-all">
        <span className="whitespace-nowrap">
          {shouldAnimate ? (
            projectText ? (
              projectText.split("").map((character: string, index: number) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: {
                      opacity: 0,
                      x: -100,
                    },
                    animate: {
                      opacity: 1,
                      x: 0,
                    },
                  }}
                  initial={shouldAnimate ? "initial" : undefined}
                  animate={shouldAnimate ? "animate" : undefined}
                  transition={{
                    duration: 0.25,
                    ease: "easeIn",
                    delay: index * 0.05,
                    staggerChildren: 0.05,
                  }}
                >
                  <span className="text-sm font-medium tracking-wide text-green-400">
                    {character}
                  </span>
                </motion.span>
              ))
            ) : (
              <span className="text-sm font-medium tracking-wide">
                {loading ? <span>....</span> : projectText}
              </span>
            )
          ) : (
            <span className="text-sm font-medium tracking-wide">
              {loading ? <span>....</span> : projectText}
            </span>
          )}
        </span>
      </div>
      <ProjectOptions 
        projectId={id} 
        isActive={active} 
        onProjectDelete={handleRemoveProject}
        currentName={projectName}
        onNameUpdate={handleNameUpdate}
      />
    </Link>
  );
};

export default ProjectRow;
