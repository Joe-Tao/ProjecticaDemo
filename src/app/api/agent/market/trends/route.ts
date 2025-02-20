import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import OpenAI from 'openai'
import { getTrendsData } from '@/services/googleTrends'
import { systemAgents } from '@/config/systemAgents'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MARKET_EXPERT = systemAgents.find(agent => agent.name === "Market Research Expert")

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { industry, timeframe = 'current', trendType } = body

    if (!industry) {
      return NextResponse.json({ error: "Industry is required" }, { status: 400 })
    }

    // Get Google Trends data
    const trendsData = await getTrendsData(industry, timeframe)
    if (!trendsData) {
      throw new Error('Failed to fetch trends data')
    }

    // Get or create the assistant
    const assistant = await getOrCreateAssistant()

    // Create a thread
    const thread = await openai.beta.threads.create()

    // Construct the message for trend analysis
    const userMessage = `
Please analyze these industry trends and provide strategic insights:

Industry: ${industry}
Trend Type: ${trendType || 'General'}
Timeframe: ${timeframe}

Google Trends Data:
${JSON.stringify(trendsData, null, 2)}

Please provide a comprehensive analysis including:
1. Current Trend Analysis
   - Interest over time patterns
   - Geographic distribution insights
   - Key spikes and drops analysis

2. Related Topics Analysis
   - Emerging themes and categories
   - Consumer interest patterns
   - Industry connection points

3. Search Behavior Analysis
   - Popular search terms
   - User intent analysis
   - Content opportunity gaps

4. Strategic Implications
   - Market opportunities
   - Potential threats
   - Recommended actions

5. Future Projections
   - Short-term forecasts
   - Long-term trend predictions
   - Impact assessment
`

    // Add the message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage
    })

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    })

    // Wait for the completion
    let response
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      
      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread.id)
        const lastMessage = messages.data[0]
        response = lastMessage.content[0].type === 'text' 
          ? lastMessage.content[0].text.value 
          : 'Non-text response received'
        break
      } else if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed')
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return NextResponse.json({
      analysis: response,
      trendsData,
      metadata: {
        industry,
        timeframe,
        trendType,
        threadId: thread.id
      }
    })

  } catch (error) {
    console.error('Trends Analysis API Error:', error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}

// Helper function to get or create assistant
async function getOrCreateAssistant() {
  try {
    const assistants = await openai.beta.assistants.list()
    const existingAssistant = assistants.data.find(
      assistant => assistant.name === MARKET_EXPERT?.name
    )

    if (existingAssistant) {
      return existingAssistant
    }

    return await openai.beta.assistants.create({
      name: MARKET_EXPERT?.name,
      description: MARKET_EXPERT?.description,
      instructions: MARKET_EXPERT?.instructions,
      model: MARKET_EXPERT?.model || "gpt-4",
      tools: []
    })
  } catch (error) {
    console.error('Error getting/creating assistant:', error)
    throw error
  }
} 