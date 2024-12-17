"use client";
import Chat from "@/components/Chat";
import React from "react";
import { useParams } from "next/navigation";
import ChatInput from "@/components/ChatInput";
import ChatHelp from "@/components/ChatHelp";
import { useSession } from "next-auth/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import toast from "react-hot-toast";

const ChatPage = () => {
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();

  const handleSaveToPlan = async (messageText: string) => {
    if (!session?.user?.email) {
      toast.error("Please sign in to save to plan");
      return;
    }

    try {
      // 获取当前的 project plan
      const planRef = doc(db, "users", session.user.email, "projects", projectId, "projectPlan", "plan");
      const planDoc = await getDoc(planRef);
      let currentContent = "";

      if (planDoc.exists()) {
        currentContent = planDoc.data().content || "";
      }

      // 将消息添加到计划末尾，添加项目符号
      const newContent = currentContent + 
        (currentContent ? "\n\n" : "") + 
        `• ${messageText}`;

      // 保存更新后的计划
      await setDoc(planRef, {
        content: newContent,
        lastUpdated: new Date().toISOString(),
      });

      toast.success("Added to project plan!");
    } catch (error) {
      console.error("Error saving to plan:", error);
      toast.error("Failed to save to plan");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 bg-gray-800/50 rounded-lg overflow-hidden">
        <Chat id={projectId} onSaveToPlan={handleSaveToPlan} />
      </div>
      <div className="sticky bottom-0 left-0 right-0 bg-gray-800/50 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4">
          <ChatInput id={projectId} />
        </div>
        <div className="flex justify-center pt-2">
          <ChatHelp />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
