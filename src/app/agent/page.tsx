'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { db } from '@/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from 'next/link'

interface Agent {
  id?: string
  name: string
  description: string
  model: string
  instructions: string
  isSystem?: boolean
  userId?: string
}

// Predefined Agent
export const systemAgents: Agent[] = [
  {
    name: "General Assistant",
    description: "A versatile AI assistant that can answer various questions",
    model: "gpt-4o",
    instructions: "You are a friendly AI assistant that helps users with various questions.",
    isSystem: true
  },
  {
    name: "Code Expert",
    description: "AI assistant focused on programming-related questions",
    model: "gpt-4o",
    instructions: "You are an expert that helps users with eamil generation and sending.",
    isSystem: true
  }
]

const models = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" }
]

export default function AgentPage() {
  const { data: session, status } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const router = useRouter()
  const [formData, setFormData] = useState<Agent>({
    name: '',
    description: '',
    model: 'gpt-4',
    instructions: ''
  })

  const initializeSystemAgents = async () => {
    if (!session?.user?.email) return;
    
    try {
      const systemAgentsRef = collection(db, "users", session.user.email, "system_agents");
      const snapshot = await getDocs(systemAgentsRef);
      
      if (snapshot.empty) {
        for (const agent of systemAgents) {
          await addDoc(systemAgentsRef, {
            ...agent,
            userId: session.user.email,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error("Error initializing system agents:", error);
    }
  };

  const fetchUserAgents = async () => {
    if (!session?.user?.email) return;
    
    try {
      // 获取用户自定义的 agents
      const userAgentsRef = collection(db, "users", session.user.email, "agents");
      const userSnapshot = await getDocs(userAgentsRef);
      const userAgents = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Agent));

      // 获取系统 agents
      const systemAgentsRef = collection(db, "users", session.user.email, "system_agents");
      const systemSnapshot = await getDocs(systemAgentsRef);
      const systemAgents = systemSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Agent));

      setAgents([...systemAgents, ...userAgents]);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load agents");
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error("Please sign in to access");
      router.push('/signin');
    } else if (status === 'authenticated') {
      initializeSystemAgents().then(() => fetchUserAgents());
    }
  }, [status, router, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email) return
    
    try {
      if (editingAgent?.id) {
        await updateDoc(
          doc(db, "users", session.user.email, "agents", editingAgent.id),
          {
            ...formData,
            userId: session.user.email
          }
        )
      } else {
        await addDoc(
          collection(db, "users", session.user.email, "agents"),
          {
            ...formData,
            userId: session.user.email
          }
        )
      }
      
      toast.success(`${editingAgent ? 'Updated' : 'Created'} successfully!`)
      setIsModalOpen(false)
      setFormData({ name: '', description: '', model: 'gpt-4', instructions: '' })
      fetchUserAgents()
    } catch (error) {
      console.error(error)
      toast.error('Operation failed, please try again')
    }
  }

  const handleDelete = async (agentId: string) => {
    if (!session?.user?.email) return
    if (!confirm('Are you sure you want to delete this agent?')) return
    
    try {
      await deleteDoc(doc(db, "users", session.user.email, "agents", agentId))
      toast.success('Deleted successfully!')
      fetchUserAgents()
    } catch (error) {
      console.error(error)
      toast.error('Delete failed, please try again')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-200 pt-16 flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-200 pt-16 flex items-center justify-center">
        Please sign in to access
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-black">AI Agents</h1>
          <Link
            href="/workspace"
            className="text-black hover:text-black/50 px-3 py-2 rounded-lg duration-300 text-sm font-medium"
          >
            Return to Workspace
          </Link>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setEditingAgent(null)
              setFormData({ name: '', description: '', model: 'gpt-4', instructions: '' })
              setIsModalOpen(true)
            }}
            className="bg-gray-800 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>Create New Agent</span>
          </button>
        </div>

        <div className="bg-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div 
                key={agent.id || agent.name}
                className="bg-gray-400/50 rounded-lg p-6 hover:bg-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-black">{agent.name}</h3>
                  {!agent.isSystem && (
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingAgent(agent)
                          setFormData(agent)
                          setIsModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => agent.id && handleDelete(agent.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-black mb-2">{agent.description}</p>
                <p className="text-sm text-gray-800">Model: {agent.model}</p>
                {!agent.isSystem && (
                  <p className="text-sm text-gray-800 mt-2">
                    Instructions: {agent.instructions}
                  </p>
                )}
                <Link
                  href={`/agent/${agent.id || 'system-' + agent.name}`}
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm"
                >
                  Run Agent
                </Link>
              </div>
            ))}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {editingAgent ? 'Edit' : 'Create'} Agent
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full border rounded p-2 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="w-full border rounded p-2 text-gray-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">AI Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                    className="w-full border rounded p-2 text-gray-500"
                  >
                    {models.map(model => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Custom Instructions</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    required
                    className="w-full border rounded p-2 text-gray-500"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setFormData({ name: '', description: '', model: 'gpt-4', instructions: '' })
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingAgent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
