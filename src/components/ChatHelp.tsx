"use client";

import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { PiFinnTheHuman, PiLightbulb, PiTreeStructure } from "react-icons/pi";
import { MdEditNote } from "react-icons/md";
import { GiGraduateCap } from "react-icons/gi";

interface Props {
    projectId?: string;
}

const chatData = [
    {
        title: "Create a new project",
        icon: <PiLightbulb />,
        iconColor: "#e2c541",
        prompt: "I want to create a new project. Please help me plan it step by step."
    },
    {
        title: "Get advice",
        icon: <MdEditNote />,
        iconColor: "#c285c7",
        prompt: "I need advice on my current project. What are some best practices and potential improvements I should consider?"
    },
    {
        title: "Give project structure",
        icon: <PiTreeStructure />,
        iconColor: "#e86060",
        prompt: "Help me create a detailed project structure including main components, features, and timeline."
    },
    // {
    //     title: "Ask Virtual Assistant",
    //     icon: <PiFinnTheHuman />,
    //     iconColor: "#76d0eb",
    //     prompt: "I need general assistance with my project. What questions should I be asking to make better progress?"
    // },
    {
        title: "Help",
        icon: <GiGraduateCap />,
        iconColor: "#76d0eb",
        prompt: "What are all the ways you can help me with my project? Please explain your capabilities."
    }
];

const ChatHelp = ({ projectId }: Props) => {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const model = "gpt-4o";

    const sendPrompt = async (prompt: string) => {
        if (!session?.user?.email || !projectId) return;
        setIsLoading(true);

        try {
            // 添加用户消息
            await addDoc(
                collection(
                    db,
                    "users",
                    session.user.email,
                    "projects",
                    projectId,
                    "messages"
                ),
                {
                    text: prompt,
                    createdAt: serverTimestamp(),
                    user: {
                        _id: session.user.email,
                        name: session.user.name,
                        avatar: session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`,
                    },
                }
            );

            // 调用 API
            const response = await fetch("/api/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: prompt,
                    id: projectId,
                    session: session.user.email,
                    model,
                }),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }

        } catch (error) {
            console.error("Error sending prompt:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full items-center md:flex-row gap-3 md:items-center justify-center">
            {chatData.map((item, index) => (
                <button
                    key={index}
                    onClick={() => !isLoading && item.prompt && sendPrompt(item.prompt)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 border border-gray-600 rounded-full px-2 py-1 hover:border-white/50 duration-300 
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                >
                    {item?.icon && (
                        <span className="text-xl" style={{ color: item?.iconColor }}>
                            {item?.icon}
                        </span>
                    )}
                    <p>{item?.title}</p>
                </button>
            ))}
        </div>
    );
};

export default ChatHelp;
