'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import AgentChat from './agentChat'

interface Reference {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
}

export default function MarketResearchPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [references, setReferences] = useState<Reference[]>([])
  const [query, setQuery] = useState('')

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agent/market/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.analysis);
        setReferences(data.references || []);
      } else {
        throw new Error(data.error || 'An error occurred');
      }
    } catch (error) {
      toast.error('Failed to get analysis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-black">Market Research Expert</h1>
            <Link href="/agent">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Back to Agents
              </button>
            </Link>
          </div>

          {/* Input Form */}
          <div className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Research Query
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., Analyze the electric vehicle market..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg text-white ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>

          {/* Results */}
          {result && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 text-black">Analysis Results</h2>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-900">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>

              {/* References */}
              {references.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold mb-2 text-black">Sources & References</h3>
                  <div className="space-y-3">
                    {references.map((ref, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <a 
                          href={ref.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {ref.title}
                        </a>
                        {ref.date && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({ref.date})
                          </span>
                        )}
                        {ref.snippet && (
                          <p className="text-sm text-gray-600 mt-1">
                            {ref.snippet}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <AgentChat />
        </div>
      </div>
    </div>
  )
}
