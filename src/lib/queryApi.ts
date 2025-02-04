import openai from "./chatgpt";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query as firestoreQuery, limit} from "firebase/firestore";

// const planFormat = `
//     The project plan MUST strictly follow this format:

// Project Plan - [Project Title]

// Overview
// [Provide a brief overview of the project, its goals, and its significance]

// Outline

// Steps:
//     1. [Step description]
//         Description: [Detailed description of the step]
//         [Description could start from who will do the work, and how to do the work]
//         Time: [Estimated time]
//         [Add sub-steps]

//     2. [Step description]
//         Description: [Detailed description of the step]
//         [Description could start from who will do the work, and how to do the work]
//         Time: [Estimated time]
//         [Add sub-steps]

//     [Add more steps as needed]

// Resources
// [List any necessary resources, tools, or references needed for this section/phase]

// Participants
// - Virtual Assistant (if needed): [Overall role in the project]
// - Product Owner (if needed): [Overall role in the project]
// `;





const query = async (prompt: string, projectId: string, model: string, userEmail: string) => {
    const systemPrompt = `
You are a project planning agent, tasked to talk with a client to help them create a project plan, but currently you are also professional as a digital marketer.

The project plan will then be executed by virtual assistants.

In each step of the conversation, you should make a draft of a project plan, and then ask a follow up question useful to improving it.

As an example, if the user send you this:

I want to market CheckItSherlock on X, and get 500k monthly impressions in six months. Here is a description:
CheckItSherlock is your ally against misinformation.
It is the first AI bot to bring fast and reliable fact-checking to X.
To use it, simply tag @CheckItSherlock under any post, and it will analyze the claims, provide context, and link to trusted sources.
With CheckItSherlock we aim to stop misinformation and create a more informed, less divided world.


You could respond like this:

CheckItSherlock sounds like a very useful X bot! I have some follow up questions to help me create a great project plan, but here is a first draft:

---

Project Plan - Market CheckItSherlock

Objective: Reach 500k monthly impression on X with

Steps:

1. Decide on Marketing Channels and Marketing Tactic.

Description
Since you have a clear description of CheckItSherlock, with a clear unique value proposition, the next step is to decide on what channels and tactics to use for marketing.

You probably want to do marketing on X, but there might be other relevant channels as well to gain traction.

Marketing tactics refers to how you use a channel to market your product. On X you could for example do paid ads, organic growth through posting, or influencer marketing.

The best way to decide on channels and tacticts is to have meetings with a few different marketing experts.

Ideally, you should meet with at least three marketing experts in order to get different perspectives.

Steps:
- Find three different marketing experts.
- Book meeting with each of them.
- Prepare for meeting by sending over information about the project.
- Discuss potential channels and tacticts viable.
- Decide on the most viable options.

2. Test Marketing Tactics

Description:
Once you have selected your marketing channels and tactics, the next step is to test them on a small scale to determine their effectiveness. The goal is to identify which strategies generate the most impressions and engagement before committing significant resources.

Steps:

- Create a Testing Plan: Define key metrics (e.g., impressions, engagement rate, conversion rate) and a testing timeline.
- A/B Testing: Run split tests with different messaging, visuals, and targeting strategies to see what resonates best.
- Monitor Results: Use analytics tools (e.g., X Analytics, Google Analytics) to measure performance and gather insights.
- Adjust & Optimize: Based on early data, tweak content, posting schedules, and targeting to improve effectiveness.

Expected Outcome:

- A clear understanding of which marketing tactics yield the best ROI.
- Data-driven insights to guide scaling efforts.

3. Scale Up Marketing Tactics

Description:
After identifying the most effective marketing tactics, the next step is to scale up those efforts to maximize impressions and engagement.

Steps:

- Increase Budget for Effective Strategies.
- Expand Audience Targeting.
- Monitor & Optimize Processes.

Expected Outcome:

- Significant increase in monthly impressions on X, with a goal of reaching 500k.
- Sustainable marketing strategies that can be refined and expanded further.

---


Here is the first message from the user:`
    try {
        // 1. Fetch chat history from Firestore
        console.time("Step 1: Fetch chat history");
        const messagesRef = collection(db, "users", userEmail, "projects", projectId, "messages");
        const q = firestoreQuery(messagesRef, orderBy("createdAt", "desc"), limit(5));
        const querySnapshot = await getDocs(q);

        console.timeEnd("Step 1: Fetch chat history");

        // Map Firestore documents to OpenAI-compatible messages
        console.time("Step 1.1: Map documents to messages");
        const history = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                role: data.user._id === "Projectica" ? "assistant" as const : "user" as const,
                content: data.text,
            };
        });

        console.timeEnd("Step 1.1: Map documents to messages");

        // Limit the history to fit token constraints

        console.time("Step 1.2: Truncate history");
        const tokenLimit = 4000; // Approximate token limit for GPT-3.5
        const truncatedHistory = truncateHistory(history, tokenLimit);

        console.timeEnd("Step 1.2: Truncate history");


        console.time("Step 2: Create system message");
        // 2. Create the system message
        const systemMessage = {
            role: "system" as const,
            content: systemPrompt,
        };
        console.timeEnd("Step 2: Create system message");


        console.time("Step 3: OpenAI API request");
        // 3. Create the OpenAI API request
        const res = await openai.chat.completions.create({
            model: model || "4o mini",
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

        console.timeEnd("Step 3: OpenAI API request");


        const assistantMessage = res.choices[0]?.message?.content;
        if (!assistantMessage) {
            throw new Error("No response from OpenAI");
        }

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
