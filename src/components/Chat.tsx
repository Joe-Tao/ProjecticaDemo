"use client";

import { db } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import React, { useRef } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import Message from "./Message";
import ChatHelp from "./ChatHelp";

interface ChatProps {
    id?: string;
    disableAutoScroll?: boolean;
    onSaveToPlan?: (text: string) => void;
}

const Chat = ({ id, onSaveToPlan }: ChatProps) => {
    const {data: session} = useSession();
    const userEmail = session?.user ? (session.user.email as string) : "unknown";
    const bottomRef = useRef<HTMLDivElement>(null);
    const [messages] = useCollection(
        id ? 
        query(
            collection(db, "users", userEmail, "projects", id, "messages"),
            orderBy("createdAt", "asc")
        )
        : null
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-2 pb-24">
                    {messages?.empty ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <ChatHelp />
                        </div>
                    ) : (
                        <>
                            {messages?.docs.map((message) => (
                                <Message 
                                    key={message.id} 
                                    message={message.data()} 
                                    onSaveToPlan={onSaveToPlan}
                                />
                            ))}
                            <div ref={bottomRef} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;