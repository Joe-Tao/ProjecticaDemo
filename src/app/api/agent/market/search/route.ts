import { NextResponse } from 'next/server'
import { auth } from "@/auth"

interface Reference {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
}

function validateAndFormatSources(responseText: string, sources: Reference[]): { text: string; references: Reference[] } {
  // Find all references in the response text
  const matches = responseText.match(/\[(\d+)]/g) || [];
  const uniqueReferences = [...new Set(matches.map(m => parseInt(m.slice(1, -1))))].sort((a, b) => a - b);

  // remove invalid references
  const validReferences = uniqueReferences.filter(ref => ref <= sources.length);

  // create reference mapping
  const referenceMapping = Object.fromEntries(
    validReferences.map((oldRef, index) => [oldRef, index + 1])
  );

  // replace reference numbers in the text
  let updatedText = responseText;
  Object.entries(referenceMapping).forEach(([oldRef, newRef]) => {
    updatedText = updatedText.replace(
      new RegExp(`\\[${oldRef}\\]`, 'g'),
      `[${newRef}]`
    );
  });

  // get ordered reference list
  let orderedSources = validReferences.map(ref => sources[ref - 1]);

  // ensure at least 3 references
  if (orderedSources.length < 3) {
    const additionalNeeded = 3 - orderedSources.length;
    const remainingSources = sources.filter(
      src => !orderedSources.includes(src)
    );
    orderedSources = [
      ...orderedSources,
      ...remainingSources.slice(0, additionalNeeded)
    ];
  }

  return {
    text: updatedText,
    references: orderedSources
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const prompt = `Please provide a comprehensive market analysis for the following query: ${query}

Your analysis should include:
1. Market Overview and Size
2. Key Competitors Analysis
3. Market Trends and Future Outlook
4. Opportunities and Challenges

Please format your response in Markdown with clear sections and bullet points.
For each major claim or data point, please cite your sources using numbered references like [1], [2], etc.`;

    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('Perplexity API key is not set');
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a market research expert. Analyze the given query and provide detailed market insights including market size, growth rate, key players, and trends. Include reliable sources and data points. Use numbered references like [1], [2] etc. to cite your sources.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      if (response.status === 401) {
        throw new Error('Invalid API key or unauthorized access');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later');
      } else if (response.status === 400) {
        throw new Error('Invalid request format');
      } else {
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Perplexity API');
    }

    const rawReferences = data.choices[0].message.references || [];
    const { text, references } = validateAndFormatSources(
      data.choices[0].message.content,
      rawReferences
    );

    return NextResponse.json({
      analysis: text,
      references,
      metadata: {
        query,
        timestamp: new Date().toISOString(),
        type: 'comprehensive_analysis'
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