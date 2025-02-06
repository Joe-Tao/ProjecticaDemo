export interface Agent {
  id?: string
  name: string
  description: string
  model: string
  instructions: string
  isSystem?: boolean
  userId?: string
}

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
    instructions: "You are a programming expert that helps users with code-related questions.",
    isSystem: true
  }
] 