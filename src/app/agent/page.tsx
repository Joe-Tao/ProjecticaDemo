'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { db } from '@/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, setDoc, query, where } from 'firebase/firestore'
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from 'next/link'
import { systemAgents, Agent } from '@/config/systemAgents'


// const models = [
//   { value: "gpt-4", label: "GPT-4" },
//   { value: "gpt-3.5-turbo", label: "GPT-3.5" },
  // { value: "claude-3-opus", label: "Claude 3 Opus" },
  // { value: "claude-3-sonnet", label: "Claude 3 Sonnet" }
// ]

export default function AgentPage() {
  const { data: session, status } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const router = useRouter()

  const initializeSystemAgents = async () => {
    if (!session?.user?.email) return;
    
    try {
      const systemAgentsRef = collection(db, "users", session.user.email, "system_agents");
      const snapshot = await getDocs(systemAgentsRef);
      const existingAgents = new Map(
        snapshot.docs.map(doc => [
          doc.data().name, 
          { id: doc.id, ...doc.data() } as Agent
        ])
      );

      for (const agent of systemAgents) {
        const existingAgent = existingAgents.get(agent.name);
        
        if (!existingAgent) {
          const querySnapshot = await getDocs(
            query(systemAgentsRef, where("name", "==", agent.name))
          );
          if (querySnapshot.empty) {
            await addDoc(systemAgentsRef, {
              ...agent,
              userId: session.user.email,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } else if (
          existingAgent.description !== agent.description ||
          existingAgent.model !== agent.model ||
          existingAgent.instructions !== agent.instructions ||
          JSON.stringify(existingAgent.tools) !== JSON.stringify(agent.tools)
        ) {
          await setDoc(doc(systemAgentsRef, existingAgent.id), {
            ...agent,
            userId: session.user.email,
            createdAt: existingAgent.createdAt, 
            updatedAt: serverTimestamp()
          });
        }
      }

      const configAgentNames = new Set(systemAgents.map(a => a.name));
      for (const [name, agent] of existingAgents) {
        if (!configAgentNames.has(name)) {
          await deleteDoc(doc(systemAgentsRef, agent.id));
        }
      }

    } catch (error) {
      console.error("Error initializing system agents:", error);
    }
  };

  const fetchUserAgents = async () => {
    if (!session?.user?.email) return;
    
    try {
      const systemAgentsRef = collection(db, "users", session.user.email, "system_agents");
      const systemSnapshot = await getDocs(systemAgentsRef);
      const dbsystemAgents = systemSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Agent));

      setAgents([...dbsystemAgents])
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

        <div className="bg-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div 
                key={agent.id || agent.name}
                className="bg-gray-400/50 rounded-lg p-6 hover:bg-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-black">{agent.name}</h3>
                </div>
                <p className="text-black mb-2">{agent.description}</p>
                <p className="text-sm text-gray-800">Model: {agent.model}</p>
                {agent.name === "Market Research Expert" && (
                  <Link
                    href="/agent/market"
                    className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Use Market Expert
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
