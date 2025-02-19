export interface Agent {
    id?: string
    name: string
    description: string
    model: string
    instructions: string
    isSystem?: boolean
    userId?: string
    createdAt?: any
    updatedAt?: any
    tools?: Array<{
      type: string
      function: {
        name: string
        description: string
        parameters: {
          type: string
          properties: {
            [key: string]: {
              type: string
              description: string
              enum?: string[]
            }
          }
          required: string[]
        }
      }
    }>
  }

export const systemAgents: Agent[] = [
  
  {
    name: "Market Research Expert",
    description: "AI assistant specialized in market research, competitor analysis, and trend forecasting",
    model: "gpt-4",
    instructions: `You are an expert market research analyst. Your role is to help users conduct comprehensive market research, analyze competitors, and identify market trends.

Key responsibilities:
1. Market Analysis
- Analyze market size, growth rates, and market segments
- Identify key market drivers and barriers
- Research market trends and future projections

2. Competitor Analysis
- Research competitor products, strategies, and market positions
- Analyze competitors' strengths and weaknesses
- Identify competitive advantages and market gaps

3. Consumer Research
- Analyze target audience demographics and behaviors
- Identify customer needs and preferences
- Research buying patterns and decision factors

When conducting research:
1. First outline the key areas to investigate
2. Use available tools to gather relevant data
3. Analyze and synthesize information into actionable insights
4. Provide clear recommendations based on findings

Always:
- Use data to support your analysis
- Consider both qualitative and quantitative aspects
- Provide actionable recommendations
- Cite sources when possible
- Highlight key uncertainties or limitations in the analysis`,
    isSystem: true,
    tools: [
      {
        type: "function",
        function: {
          name: "search_market_data",
          description: "Search for market data, statistics, and trends",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for market information"
              },
              dataType: {
                type: "string",
                enum: ["market_size", "competitors", "trends", "consumers"],
                description: "Type of market data to search for"
              },
              timeframe: {
                type: "string",
                enum: ["current", "historical", "forecast"],
                description: "Timeframe for the data"
              }
            },
            required: ["query", "dataType"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_competitors",
          description: "Analyze specific competitors in the market",
          parameters: {
            type: "object",
            properties: {
              companyName: {
                type: "string",
                description: "Name of the competitor to analyze"
              },
              aspects: {
                type: "array",
                description: "Aspects of the competitor to analyze",
                enum: ["products", "pricing", "strategy", "strengths", "weaknesses"]
              }
            },
            required: ["companyName"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_market_trends",
          description: "Get current and emerging market trends",
          parameters: {
            type: "object",
            properties: {
              industry: {
                type: "string",
                description: "Industry or market segment to analyze"
              },
              trendType: {
                type: "string",
                enum: ["consumer", "technology", "regulatory", "economic"],
                description: "Type of trends to analyze"
              }
            },
            required: ["industry"]
          }
        }
      }
    ]
  }
] 