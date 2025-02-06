import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Agent } from '@/config/systemAgents'

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 修正 API Handler
export async function POST(req: Request, { params }: { params: { agentId: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { input, taskId } = await req.json()
    if (!input || !taskId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { agentId } = await params  // 这里改为从 params 获取

    // 获取用户定义的 agent
    let agent: Agent
    const agentDoc = await getDoc(doc(db, "users", session.user.email, "agents", agentId))
    if (!agentDoc.exists()) {
      // 如果找不到，尝试获取系统预设的 agent
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

    // 生成 AI 任务响应
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
      { error: error || "Something went wrong" },
      { status: 500 }
    )
  }
}
