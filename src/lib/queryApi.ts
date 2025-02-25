import OpenAI from "openai";
import { db } from "@/firebase";
import {doc, setDoc, getDoc } from "firebase/firestore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const query = async (
  prompt: string, 
  projectId: string, 
  model: string, 
  userEmail: string,
  onProgress?: (content: string) => void
) => {
  const systemPrompt = `You are a project planning agent, called Projectica, tasked to talk with a client to help them create a project plan, but currently you are also professional as a digital marketer.

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
Please return plain text without Markdown formatting.

Here is the first message from the user:`
  
  try {
    console.time("Step 1: Get/Create Assistant");
    let assistant;
    try {
      assistant = await openai.beta.assistants.retrieve(projectId);
    } catch {
      assistant = await openai.beta.assistants.create({
        name: "Project Planning Assistant",
        instructions: systemPrompt,
        model: model || "gpt-4",
      });
    }
    console.timeEnd("Step 1: Get/Create Assistant");

    console.time("Step 2: Get/Create Thread");
    let threadId;
    const threadRef = doc(db, "users", userEmail, "projects", projectId, "threads", "current");
    const threadDoc = await getDoc(threadRef);
    
    if (threadDoc.exists()) {
      threadId = threadDoc.data().threadId;
    } else {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      await setDoc(threadRef, { threadId });
    }
    console.log("Thread id is: ",threadId)
    console.timeEnd("Step 2: Get/Create Thread");

    console.time("Step 3: Add Message");
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: prompt
    });
    console.timeEnd("Step 3: Add Message");

    console.time("Step 4: Run Assistant");
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistant.id,
      instructions: "Please provide a concise and actionable response based on the project context."
    });

    let fullResponse = '';
    let retryCount = 0;
    const maxRetries = 10;
    const initialDelay = 500;

    while (retryCount < maxRetries) {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      
      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId, {
          limit: 1,
          order: 'desc'
        });

        const messageContent = messages.data[0].content[0];
        if (messageContent.type === 'text') {
          const newContent = messageContent.text.value;
          
          if (newContent !== fullResponse) {
            fullResponse = newContent;
            if (onProgress) {
              onProgress(fullResponse);
            }
          }
        }
        break;
      } else if (runStatus.status === 'in_progress') {
        const pendingMessages = await openai.beta.threads.messages.list(threadId, {
          limit: 1,
          order: 'desc'
        });

        if (pendingMessages.data[0]?.content[0]?.type === 'text') {
          const partialContent = pendingMessages.data[0].content[0].text.value;
          if (partialContent !== fullResponse) {
            fullResponse = partialContent;
            if (onProgress) {
              onProgress(fullResponse);
            }
          }
        }
      } else if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed');
      }

      const delay = initialDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
    console.timeEnd("Step 4: Run Assistant");

    if (!fullResponse) {
      throw new Error('Response timeout');
    }

    return fullResponse;

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

export default query;
