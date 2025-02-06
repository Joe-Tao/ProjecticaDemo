'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from 'next/link'
import { useParams } from 'next/navigation';

interface Agent {
  id?: string
  name: string
  description: string
  model: string
  instructions: string
  isSystem?: boolean
  userId?: string
}

export default function TestAgentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const params = useParams();

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error("Please sign in to access");
      router.push('/signin');
      return;
    }
  
    if (status !== 'authenticated' || !session?.user?.email || !params.id) {
      return;
    }
  
    const fetchAgent = async () => {
      const agentId = params.id as string;
      const userEmail = session?.user?.email;
      if (!userEmail) {
        toast.error("User email not found");
        return;
      }
  
      try {
        // 先检查系统 agents
        const systemAgentDoc = await getDoc(
          doc(db, "users", userEmail, "system_agents", agentId)
        );
  
        if (systemAgentDoc.exists()) {
          setAgent({ id: systemAgentDoc.id, ...systemAgentDoc.data() } as Agent);
          return;
        }
  
        // 如果不是系统 agent，检查用户自定义 agents
        const userAgentDoc = await getDoc(
          doc(db, "users", userEmail, "agents", agentId)
        );
  
        if (userAgentDoc.exists()) {
          setAgent({ id: userAgentDoc.id, ...userAgentDoc.data() } as Agent);
        } else {
          toast.error("Agent not found");
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast.error("Failed to load agent");
      }
    };
  
    fetchAgent();
  }, [session, status, params.id]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agent || !input.trim() || !agent.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/agent/${agent.id}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          taskId: 'test-' + Date.now() // 为测试页面生成临时 taskId
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResponse(data.response)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to get response:')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !agent) {
    return (
      <div className="min-h-screen bg-gray-200 pt-16 flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-black">Test Agent: {agent.name}</h1>
          <Link
            href="/agent"
            className="text-black hover:text-black/50 px-3 py-2 rounded-lg duration-300 text-sm font-medium"
          >
            Back to Agents
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Your Message</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                className="w-full border rounded p-2 text-gray-600"
                rows={4}
                placeholder="Type your message here..."
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>

          {response && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Response:</h3>
              <div className="bg-gray-50 rounded p-4">
                <p className="whitespace-pre-wrap text-gray-800">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 