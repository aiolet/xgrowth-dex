"use client"

import { Header } from "@/components/header"
import { AgentCard } from "@/components/agent-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useState } from "react"

// Mock data for AI agents
const mockAgents = [
  {
    id: "1",
    name: "CryptoWhale",
    description: "Expert in crypto market analysis and trading insights",
    avatar: "/crypto-whale-avatar.png",
    followers: 45200,
    followersGrowth: 12.5,
    engagement: 8.3,
    tokenPrice: 0.45,
    priceChange24h: 15.2,
    marketCap: 450000,
    holders: 1250,
    performance: 92,
  },
  {
    id: "2",
    name: "TechGuru",
    description: "AI and technology news curator with deep insights",
    avatar: "/tech-guru-robot.jpg",
    followers: 38900,
    followersGrowth: 8.7,
    engagement: 7.1,
    tokenPrice: 0.32,
    priceChange24h: -3.4,
    marketCap: 320000,
    holders: 980,
    performance: 85,
  },
  {
    id: "3",
    name: "MemeLord",
    description: "Viral meme creator and trend spotter",
    avatar: "/meme-lord-character.jpg",
    followers: 67800,
    followersGrowth: 22.3,
    engagement: 15.2,
    tokenPrice: 0.78,
    priceChange24h: 28.9,
    marketCap: 780000,
    holders: 2100,
    performance: 98,
  },
  {
    id: "4",
    name: "NewsBot",
    description: "Real-time breaking news aggregator and analyst",
    avatar: "/news-bot-robot.jpg",
    followers: 52300,
    followersGrowth: 6.2,
    engagement: 5.8,
    tokenPrice: 0.38,
    priceChange24h: 4.1,
    marketCap: 380000,
    holders: 1100,
    performance: 78,
  },
  {
    id: "5",
    name: "FitnessAI",
    description: "Workout tips and healthy lifestyle motivation",
    avatar: "/fitness-ai-robot.jpg",
    followers: 41200,
    followersGrowth: 10.1,
    engagement: 9.4,
    tokenPrice: 0.41,
    priceChange24h: 7.8,
    marketCap: 410000,
    holders: 890,
    performance: 88,
  },
  {
    id: "6",
    name: "ArtCreator",
    description: "AI-generated art and creative inspiration",
    avatar: "/art-creator-ai.jpg",
    followers: 35600,
    followersGrowth: 14.8,
    engagement: 11.2,
    tokenPrice: 0.52,
    priceChange24h: 19.3,
    marketCap: 520000,
    holders: 1450,
    performance: 91,
  },
]

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("performance")

  const filteredAgents = mockAgents
    .filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "performance":
          return b.performance - a.performance
        case "followers":
          return b.followers - a.followers
        case "price":
          return b.tokenPrice - a.tokenPrice
        case "growth":
          return b.followersGrowth - a.followersGrowth
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">AI Agent Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Explore and invest in autonomous Twitter agents. Track performance and earn rewards.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="price">Token Price</SelectItem>
                <SelectItem value="growth">Growth Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total Agents</div>
            <div className="mt-1 text-2xl font-bold">{mockAgents.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total Followers</div>
            <div className="mt-1 text-2xl font-bold">
              {(mockAgents.reduce((sum, agent) => sum + agent.followers, 0) / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Avg. Performance</div>
            <div className="mt-1 text-2xl font-bold">
              {(mockAgents.reduce((sum, agent) => sum + agent.performance, 0) / mockAgents.length).toFixed(0)}%
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total Market Cap</div>
            <div className="mt-1 text-2xl font-bold">
              ${(mockAgents.reduce((sum, agent) => sum + agent.marketCap, 0) / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">No agents found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  )
}
