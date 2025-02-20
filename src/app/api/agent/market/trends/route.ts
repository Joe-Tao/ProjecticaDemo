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
      console.error('Failed to fetch trends data for industry:', industry);
      return NextResponse.json({ error: "Failed to fetch Google Trends data" }, { status: 500 })
    }

    // Get or create the assistant
    let assistant;
    try {
      assistant = await getOrCreateAssistant()
    } catch (error) {
      console.error('Error creating/getting assistant:', error);
      return NextResponse.json({ error: "Failed to initialize OpenAI assistant" }, { status: 500 })
    }

    // Create a thread
    let thread;
    try {
      thread = await openai.beta.threads.create()
    } catch (error) {
      console.error('Error creating thread:', error);
      return NextResponse.json({ error: "Failed to create analysis thread" }, { status: 500 })
    }

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

    try {
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
      let attempts = 0
      const maxAttempts = 30 // 30秒超时
      
      while (attempts < maxAttempts) {
        const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
        
        if (runStatus.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(thread.id)
          const lastMessage = messages.data[0]
          response = lastMessage.content[0].type === 'text' 
            ? lastMessage.content[0].text.value 
            : 'Non-text response received'
          break
        } else if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed: ' + runStatus.last_error?.message)
        }
        
        attempts++
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!response) {
        throw new Error('Analysis timed out')
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
      console.error('Error in analysis process:', error);
      return NextResponse.json(
        { error: `Analysis process failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Trends Analysis API Error:', error)
    return NextResponse.json(
      { error: `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}` },
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

    if (!MARKET_EXPERT) {
      throw new Error('Market Expert configuration not found')
    }

    return await openai.beta.assistants.create({
      name: MARKET_EXPERT.name,
      description: MARKET_EXPERT.description,
      instructions: MARKET_EXPERT.instructions,
      model: MARKET_EXPERT.model || "gpt-4",
      tools: []
    })
  } catch (error) {
    console.error('Error getting/creating assistant:', error)
    throw error
  }
} 