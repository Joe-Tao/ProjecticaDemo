interface PerplexityResponse {
  text: string;
  references?: Array<{
    title: string;
    url: string;
  }>;
}

export async function searchMarketData(query: string): Promise<PerplexityResponse> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a market research expert. Analyze the given query and provide detailed market insights including market size, growth rate, key players, and trends. Include reliable sources and data points.'
          },
          {
            role: 'user',
            content: query
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Perplexity API');
    }

    return {
      text: data.choices[0].message.content,
      references: data.choices[0].message.references || []
    };
  } catch (error) {
    console.error('Perplexity API Error:', error);
    return {
      text: `Error fetching market data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      references: []
    };
  }
}

export async function analyzeCompetitor(companyName: string): Promise<PerplexityResponse> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a competitive analysis expert. Provide a detailed analysis of the specified company including their market position, products/services, strengths, weaknesses, and competitive advantages. Include recent data and market developments.'
          },
          {
            role: 'user',
            content: `Analyze the company: ${companyName}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Perplexity API');
    }

    return {
      text: data.choices[0].message.content,
      references: data.choices[0].message.references || []
    };
  } catch (error) {
    console.error('Perplexity API Error:', error);
    return {
      text: `Error analyzing competitor: ${error instanceof Error ? error.message : 'Unknown error'}`,
      references: []
    };
  }
} 