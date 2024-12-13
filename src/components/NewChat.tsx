"use client";
import { FaPlus } from "react-icons/fa";
import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const NewChat = () => {
    const router = useRouter();
    const {data: session} = useSession();

    const userEmail = session?.user ? (session?.user?.email as string) : "unknown";
    const createNewProject = async() => {
        //creating a new project id in firestore
        const doc = await addDoc(
          collection(db, "users", userEmail, "projects"),
          {
            userId: userEmail,
            createdAt: serverTimestamp(),
          }
      )
        router.push(`/project/${doc?.id}`);
    }
  return (
    <button onClick={createNewProject} className="flex items-center justify-center gap-2 border border-white/10 text-xs md:text-base p-1 md:pd-2 rounded-md text-white/50 hover:border-white/50 hover:text-white duration-300 px-2 py-1">
        <FaPlus />
        New Project
    </button>
  );
};

export default NewChat;
