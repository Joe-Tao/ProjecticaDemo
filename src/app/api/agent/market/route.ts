import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import OpenAI from 'openai'
import { systemAgents } from '@/config/systemAgents'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MARKET_EXPERT = systemAgents.find(agent => agent.name === "Market Research Expert")

// Create or get assistant
async function getOrCreateAssistant() {
  try {
    // Try to retrieve the assistant first
    const assistants = await openai.beta.assistants.list()
    const existingAssistant = assistants.data.find(
      assistant => assistant.name === MARKET_EXPERT?.name
    )

    if (existingAssistant) {
      return existingAssistant
    }

    // If not found, create a new assistant
    return await openai.beta.assistants.create({
      name: MARKET_EXPERT?.name,
      description: MARKET_EXPERT?.description,
      instructions: MARKET_EXPERT?.instructions,
      model: MARKET_EXPERT?.model || "gpt-4",
      tools: MARKET_EXPERT?.tools?.map(tool => ({
        type: "function" as const,
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters
        }
      })) || []
    })
  } catch (error) {
    console.error('Error getting/creating assistant:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { functionName, ...params } = body

    // Validate function name
    const tool = MARKET_EXPERT?.tools?.find(t => t.function.name === functionName)
    if (!tool) {
      return NextResponse.json({ error: "Invalid function name" }, { status: 400 })
    }

    // Validate required parameters
    const missingParams = tool.function.parameters.required.filter(param => !(param in params))
    if (missingParams.length > 0) {
      return NextResponse.json({ 
        error: `Missing required parameters: ${missingParams.join(', ')}` 
      }, { status: 400 })
    }

    // Get or create the assistant
    const assistant = await getOrCreateAssistant()

    // Create a thread
    const thread = await openai.beta.threads.create()

    // Construct the message based on function type
    let userMessage = ''
    switch (functionName) {
      case 'search_market_data':
        const { query, dataType, timeframe } = params
        userMessage = `
Please analyze the following market data:
- Query: ${query}
- Data Type: ${dataType}
${timeframe ? `- Timeframe: ${timeframe}` : ''}

Focus on providing:
1. Key data points and statistics
2. Major trends and patterns
3. Market drivers and influencing factors
4. Actionable insights and recommendations`
        break

      case 'analyze_competitors':
        const { companyName, aspects } = params
        userMessage = `
Please provide a competitive analysis for ${companyName}:
${aspects ? `Focus on these aspects: ${aspects.join(', ')}` : ''}

Include in your analysis:
1. Company overview
2. Market positioning
3. Competitive advantages
4. Potential threats
5. Strategic recommendations`
        break

      case 'get_market_trends':
        const { industry, trendType } = params
        userMessage = `
Please analyze ${trendType} trends in the ${industry} industry.

Include in your analysis:
1. Current major trends
2. Emerging trends
3. Potential opportunities
4. Possible threats
5. Strategic recommendations`
        break
    }

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
      } else if (runStatus.status === 'requires_action') {
        // Handle tool calls
        const toolCalls = runStatus.required_action?.submit_tool_outputs.tool_calls || []
        const toolOutputs = []

        for (const toolCall of toolCalls) {
          if (toolCall.function) {
            const { name, arguments: argsStr } = toolCall.function
            let result = ''
            const args = JSON.parse(argsStr)

            // Process each function call
            switch (name) {
              case 'search_market_data':
                result = JSON.stringify({
                  status: "success",
                  data: {
                    query: args.query,
                    type: args.dataType,
                    timeframe: args.timeframe,
                    // Add mock data or integrate with real data sources
                    results: `Market data found for ${args.query}`
                  }
                })
                break

              case 'analyze_competitors':
                result = JSON.stringify({
                  status: "success",
                  data: {
                    company: args.companyName,
                    aspects: args.aspects,
                    // Add mock data or integrate with real data sources
                    analysis: `Competitor analysis for ${args.companyName}`
                  }
                })
                break

              case 'get_market_trends':
                result = JSON.stringify({
                  status: "success",
                  data: {
                    industry: args.industry,
                    trendType: args.trendType,
                    // Add mock data or integrate with real data sources
                    trends: `Market trends for ${args.industry}`
                  }
                })
                break

              default:
                result = JSON.stringify({
                  status: "error",
                  message: `Unknown function: ${name}`
                })
            }

            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: result
            })
          }
        }

        // Submit tool outputs back to the assistant
        await openai.beta.threads.runs.submitToolOutputs(
          thread.id,
          run.id,
          { tool_outputs: toolOutputs }
        )

        // Continue the loop to wait for completion
        continue
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Return the analysis
    return NextResponse.json({
      analysis: response,
      metadata: {
        function: functionName,
        params: params,
        threadId: thread.id
      }
    })

  } catch (error) {
    console.error('Market Research API Error:', error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}
