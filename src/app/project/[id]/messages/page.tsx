"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Image from "next/image";
import { FiSend } from "react-icons/fi";
import toast from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  sender: {
    email: string;
    name: string;
    image: string;
  };
  createdAt: any;
}

export default function MessagesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  // 加载项目成员
  useEffect(() => {
    const fetchMembers = async () => {
      if (!session?.user?.email) return;
      try {
        const membersRef = doc(db, "users", session.user.email, "projects", projectId, "members", "list");
        const membersDoc = await getDoc(membersRef);
        if (membersDoc.exists()) {
          setProjectMembers(membersDoc.data().members || []);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, [projectId, session?.user?.email]);

  // 实时监听消息
  useEffect(() => {
    if (!session?.user?.email) return;

    const messagesRef = collection(db, "users", session.user.email, "projects", projectId, "projectMessages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [projectId, session?.user?.email]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    try {
      const messagesRef = collection(db, "users", session?.user?.email as string, "projects", projectId, "projectMessages");
      await addDoc(messagesRef, {
        content: newMessage,
        sender: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        },
        createdAt: serverTimestamp()
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col h-[calc(100vh-12rem)]">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender.email === session?.user?.email
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              {/* 头像 */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={message.sender.image || "/default-avatar.png"}
                  alt={message.sender.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 消息内容 */}
              <div
                className={`max-w-[70%] ${
                  message.sender.email === session?.user?.email
                    ? "bg-blue-600"
                    : "bg-gray-700"
                } rounded-lg p-3`}
              >
                <div className="text-sm text-gray-300 mb-1">
                  {message.sender.name}
                </div>
                <p className="text-white">{message.content}</p>
                <div className="text-xs text-gray-400 mt-1">
                  {message.createdAt?.toDate().toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 输入框 */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}
