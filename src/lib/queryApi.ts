import openai from "./chatgpt";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query as firestoreQuery } from "firebase/firestore";

const planFormat = `
    The project plan MUST strictly follow this format:

Project Plan - [Project Title]

Overview
[Provide a brief overview of the project, its goals, and its significance]

Outline

Steps:
    1. [Step description]
        Description: [Detailed description of the step]
        [Description could start from who will do the work, and how to do the work]
        Time: [Estimated time]
        [Add sub-steps]

    2. [Step description]
        Description: [Detailed description of the step]
        [Description could start from who will do the work, and how to do the work]
        Time: [Estimated time]
        [Add sub-steps]

    [Add more steps as needed]

Resources
[List any necessary resources, tools, or references needed for this section/phase]

Participants
- Virtual Assistant (if needed): [Overall role in the project]
- Product Owner (if needed): [Overall role in the project]
`;

const query = async(prompt: string, projectId: string, model: string, userEmail: string) => {
    try {
        // 从 Firestore 获取历史消息
        const messagesRef = collection(db, "users", userEmail, "projects", projectId, "messages");
        const q = firestoreQuery(messagesRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        
        // 构建对话历史，修复类型问题
        const history = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                role: data.user._id === "Projectica" ? "assistant" as const : "user" as const,
                content: data.text
            };
        }).slice(-5); // 只保留最近的5条消息

        // 系统提示词
        const systemMessage = {
            role: "system" as const,
            content: `You are Projectica, an AI assistant specialized in project planning and management. Your task is to gather detailed information about the user's project. Ask relevant questions one at a time to understand the project's scope, goals, timeline, resources, and any other important aspects. We can always provide with a project plan when user asks for it. The project plan MUST strictly follow this format: ${planFormat}. Remember to maintain context from previous messages in the conversation.`,
        };

        // 创建 OpenAI 请求，包含历史消息
        const res = await openai.chat.completions.create({
            model: model || "gpt-3.5-turbo",
            messages: [
                systemMessage,
                ...history,
                {
                    role: "user" as const,
                    content: prompt,
                }
            ],
            temperature: 0.9,
            top_p: 1,
        });

        if (!res.choices[0]?.message?.content) {
            throw new Error("No response from OpenAI");
        }

        return res.choices[0].message.content;
    } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Query Error:", err);
          throw err; // 向上抛出错误以便更好地处理
        } else {
          console.error("Unknown error:", err);
          throw new Error("An unknown error occurred");
        }
      }
      
}

export default query;