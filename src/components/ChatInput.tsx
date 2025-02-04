"use client";
import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { TbSend } from "react-icons/tb";
import { MdOutlineTipsAndUpdates } from "react-icons/md";


const ChatInput = ({id}:{ id?: string }) => {
  const [prompt, setPrompt] = useState("");
  const {data: session} = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const model = "gpt-4o";
  const userEmail = session?.user ? (session?.user?.email as string) : "unknown";

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(loading)
    e.preventDefault();
    if(!prompt) return;
    const input = prompt.trim();
    const message = {
      text: input,
      createdAt: serverTimestamp(),
      user: {
        _id: userEmail,
        name: userEmail,
        avatar: (session?.user?.image as string) || "https://i.ibb.co/LPxtKn4/user.jpg",
      },
    }
    try {
      setLoading(true);
      let projectDocumentId = id
      if(!id) {
       const docRef = await addDoc(
        collection(db, "users", userEmail, "projects"),
        {
          userId: userEmail,
          createdAt: serverTimestamp(),
        }
       );
       projectDocumentId = docRef.id;
       router.push(`/project/${projectDocumentId}`);
      } 

      await addDoc(
        collection(db, "users", userEmail, "projects", projectDocumentId as string, "messages"),
        message
      );
      setPrompt("");

      const notification = toast.loading("Projectica is thinking...");

      //Sending api request to openai
      await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          id: projectDocumentId,
          model,
          session: userEmail,
        }),
      }).then(async (res) => {
        const data = await res.json();
        if(data?.success) {
          toast.success(data?.message, {
            id: notification,
          });
        } else {
          toast.error(data?.message, {
            id: notification,
          });
        }
      });
    } catch (error) {
      console.error("Error sending messages", error);
      toast.error("Error sending messages, please try again.");
    } finally {
      setLoading(false);
    }
  } 

  
  return (
    <div className="flex flex-col items-center justify-center mx-auto pt-3 px-4 w-full">
      <form
        onSubmit={sendMessage}
        action=""
        className="bg-black/10 rounded-full flex items-center px-4 py-2.5 w-full"
      >
        <MdOutlineTipsAndUpdates className="text-2xl text-gray-400 hover:text-black cursor-pointer" onClick={() => setPrompt("Please generate a plan for me based on the current information")}/>
        <input
          type="text"
          placeholder="Message Projectica"
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          className="bg-transparent text-black placeholder:text-gray-400 px-3 outline-none w-full font-medium tracking-wide"
        />
        <button type="submit" disabled={!prompt} className="p-2.5 rounded-full text-black bg-gray-300 disabled:bg-gray-500 hover:bg-white">
          <TbSend  className="text-sm text-black "/>
        </button>
      </form>
      {/* <p className="text-xs mt-2 font-medium tracking-wide">
        Projectica may make mistakes. Check important info.
      </p> */}
      {/* ModelSelection */}
    </div>
  );
};

export default ChatInput;
