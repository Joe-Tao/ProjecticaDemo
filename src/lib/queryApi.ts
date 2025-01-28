import openai from "./chatgpt";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query as firestoreQuery, addDoc, serverTimestamp } from "firebase/firestore";

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

const query = async (prompt: string, projectId: string, model: string, userEmail: string) => {
    try {
        // 1. Fetch chat history from Firestore
        const messagesRef = collection(db, "users", userEmail, "projects", projectId, "messages");
        const q = firestoreQuery(messagesRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);

        // Map Firestore documents to OpenAI-compatible messages
        const history = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                role: data.user._id === "Projectica" ? "assistant" as const : "user" as const,
                content: data.text,
            };
        });

        // Limit the history to fit token constraints
        const tokenLimit = 4000; // Approximate token limit for GPT-3.5
        const truncatedHistory = truncateHistory(history, tokenLimit);

        // 2. Create the system message
        const systemMessage = {
            role: "system" as const,
            content: `You are Projectica, an AI assistant specialized in project planning and management. Your task is to gather detailed information about the user's project. Ask relevant questions one at a time to understand the project's scope, goals, timeline, resources, and any other important aspects. We can always provide a project plan when the user asks for it. The project plan MUST strictly follow this format: ${planFormat}. Remember to maintain context from previous messages in the conversation.`,
        };

        // 3. Create the OpenAI API request
        const res = await openai.chat.completions.create({
            model: model || "gpt-3.5-turbo",
            messages: [
                systemMessage,
                ...truncatedHistory,
                {
                    role: "user" as const,
                    content: prompt,
                },
            ],
            temperature: 0.9,
            top_p: 1,
        });

        const assistantMessage = res.choices[0]?.message?.content;
        if (!assistantMessage) {
            throw new Error("No response from OpenAI");
        }

        // 4. Save the new messages to Firestore
        // await addDoc(messagesRef, {
        //     text: prompt,
        //     user: { _id: userEmail },
        //     createdAt: serverTimestamp(),
        // });

        // await addDoc(messagesRef, {
        //     text: assistantMessage,
        //     user: { _id: "Projectica" },
        //     createdAt: serverTimestamp(),
        // });

        return assistantMessage;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Query Error:", err);
            throw err;
        } else {
            console.error("Unknown error:", err);
            throw new Error("An unknown error occurred");
        }
    }
};

/**
 * Truncate the chat history to fit within the token limit.
 * @param history The complete chat history
 * @param tokenLimit The token limit for the OpenAI model
 */
function truncateHistory(history: { role: "user" | "assistant"; content: string }[], tokenLimit: number) {
    let totalTokens = 0;
    const truncatedHistory: typeof history = [];

    for (let i = history.length - 1; i >= 0; i--) {
        const messageTokens = estimateTokens(history[i].content);
        if (totalTokens + messageTokens > tokenLimit) break;

        truncatedHistory.unshift(history[i]);
        totalTokens += messageTokens;
    }

    return truncatedHistory;
}

/**
 * Estimate the number of tokens in a message string.
 * OpenAI token calculation is approximate here.
 */
function estimateTokens(content: string) {
    return Math.ceil(content.split(/\s+/).length * 1.5); // Assume ~1.5 tokens per word
}

export default query;
