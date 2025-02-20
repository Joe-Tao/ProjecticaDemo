'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import AgentChat from './agentChat'


type MarketDataType = 'market_size' | 'competitors' | 'trends' | 'consumers'
type TimeframeType = 'current' | 'historical' | 'forecast'
type CompetitorAspect = 'products' | 'pricing' | 'strategy' | 'strengths' | 'weaknesses'
type TrendType = 'consumer' | 'technology' | 'regulatory' | 'economic'

export default function MarketResearchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'market' | 'competitor' | 'trends'>('market')
  const [result, setResult] = useState<string>('')

  // Market Data Search States
  const [marketQuery, setMarketQuery] = useState('')
  const [dataType, setDataType] = useState<MarketDataType>('market_size')
  const [timeframe, setTimeframe] = useState<TimeframeType>('current')

  // Competitor Analysis States
  const [companyName, setCompanyName] = useState('')
  const [aspects, setAspects] = useState<CompetitorAspect[]>([])

  // Market Trends States
  const [industry, setIndustry] = useState('')
  const [trendType, setTrendType] = useState<TrendType>('technology')

  const handleSubmit = async () => {
    try {
      setLoading(true)
      let response;

      switch (activeTab) {
        case 'market':
          response = await fetch('/api/agent/market/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: marketQuery,
              dataType,
              timeframe
            })
          });
          break;

        case 'competitor':
          response = await fetch('/api/agent/market/competitor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              companyName,
              aspects: aspects.length > 0 ? aspects : undefined
            })
          });
          break;

        case 'trends':
          response = await fetch('/api/agent/market/trends', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              industry,
              trendType,
              timeframe
            })
          });
          break;
      }

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.analysis);
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
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'market'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Market Data
            </button>
            <button
              onClick={() => setActiveTab('competitor')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'competitor'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Competitor Analysis
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'trends'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Market Trends
            </button>
          </div>

          {/* Input Forms */}
          <div className="mb-6">
            {activeTab === 'market' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Market Query
                  </label>
                  <input
                    type="text"
                    value={marketQuery}
                    onChange={(e) => setMarketQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Electric Vehicle Market in Asia"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Type
                    </label>
                    <select
                      value={dataType}
                      onChange={(e) => setDataType(e.target.value as MarketDataType)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="market_size">Market Size</option>
                      <option value="competitors">Competitors</option>
                      <option value="trends">Trends</option>
                      <option value="consumers">Consumers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeframe
                    </label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value as TimeframeType)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="current">Current</option>
                      <option value="historical">Historical</option>
                      <option value="forecast">Forecast</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'competitor' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Tesla, Inc."
                  />
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Artificial Intelligence"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trend Type
                  </label>
                  <select
                    value={trendType}
                    onChange={(e) => setTrendType(e.target.value as TrendType)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="consumer">Consumer</option>
                    <option value="technology">Technology</option>
                    <option value="regulatory">Regulatory</option>
                    <option value="economic">Economic</option>
                  </select>
                </div>
              </div>
            )}
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
            </div>
          )}
          <AgentChat />
        </div>
      </div>
    </div>
  )
}
