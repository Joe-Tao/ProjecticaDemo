import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { analyzeCompetitor } from '@/services/perplexity'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { companyName, aspects } = body

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    const perplexityData = await analyzeCompetitor(companyName)

    return NextResponse.json({
      analysis: perplexityData.text,
      references: perplexityData.references,
      metadata: {
        companyName,
        aspects
      }
    })

  } catch (error) {
    console.error('Competitor Analysis API Error:', error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
} 