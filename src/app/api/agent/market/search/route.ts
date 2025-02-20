import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { searchMarketData } from '@/services/perplexity'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { query, dataType, timeframe } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const perplexityData = await searchMarketData(query)

    return NextResponse.json({
      analysis: perplexityData.text,
      references: perplexityData.references,
      metadata: {
        query,
        dataType,
        timeframe
      }
    })

  } catch (error) {
    console.error('Market Search API Error:', error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
} 