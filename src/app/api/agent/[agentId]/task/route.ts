import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  instructions: string;
  isSystem?: boolean;
  userId?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  req: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { input, taskId } = await req.json()
    if (!input || !taskId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const {agentId} = await params
    // Recieve agent information
    let agent: Agent;
    const agentDoc = await getDoc(doc(db, "users", session.user.email, "agents", agentId))
    if (!agentDoc.exists()) {
      // If can not find agents, go to system agents
      const systemAgentDoc = await getDoc(
        doc(db, "users", session.user.email, "system_agents", agentId)
      )
      if (!systemAgentDoc.exists()) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 })
      }
      agent = { id: systemAgentDoc.id, ...systemAgentDoc.data() } as Agent
    } else {
      agent = { id: agentDoc.id, ...agentDoc.data() } as Agent
    }

    const completion = await openai.chat.completions.create({
      model: agent.model === 'gpt-4o' ? 'gpt-4' : agent.model,
      messages: [
        { role: "system", content: agent.instructions },
        { role: "user", content: input }
      ],
    })

    return NextResponse.json({
      taskId,
      response: completion.choices[0].message.content
    })

  } catch (error) {
    console.error('Error in agent task API:', error)
    return NextResponse.json(
      { error: error|| "Something went wrong" },
      { status: 500 }
    )
  }
} 