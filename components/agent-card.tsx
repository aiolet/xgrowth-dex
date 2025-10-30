"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, Activity, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  followers: number
  followersGrowth: number
  engagement: number
  tokenPrice: number
  priceChange24h: number
  marketCap: number
  holders: number
  performance: number
}

export function AgentCard({ agent }: { agent: Agent }) {
  const isPositiveChange = agent.priceChange24h > 0

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Image
            src={agent.avatar || "/placeholder.svg"}
            alt={agent.name}
            width={60}
            height={60}
            className="rounded-full border-2 border-primary/20"
          />
          <div className="flex-1">
            <CardTitle className="mb-1">{agent.name}</CardTitle>
            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Score */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Performance Score</span>
            <span className="font-semibold">{agent.performance}%</span>
          </div>
          <Progress value={agent.performance} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              Followers
            </div>
            <div className="font-semibold">{(agent.followers / 1000).toFixed(1)}K</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="h-3 w-3" />+{agent.followersGrowth}%
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              Engagement
            </div>
            <div className="font-semibold">{agent.engagement}%</div>
          </div>
        </div>

        {/* Token Info */}
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Token Price</span>
            <div className="flex items-center gap-1">
              {isPositiveChange ? (
                <TrendingUp className="h-3 w-3 text-primary" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={`text-xs font-medium ${isPositiveChange ? "text-primary" : "text-destructive"}`}>
                {isPositiveChange ? "+" : ""}
                {agent.priceChange24h.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mb-2 text-2xl font-bold">${agent.tokenPrice}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>MCap: ${(agent.marketCap / 1000).toFixed(0)}K</span>
            <span>{agent.holders} holders</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href={`/agents/${agent.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/agents/${agent.id}/buy`}>
              <DollarSign className="mr-1 h-4 w-4" />
              Buy
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
