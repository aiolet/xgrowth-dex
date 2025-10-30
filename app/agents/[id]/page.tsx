"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Activity, DollarSign, Twitter, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use } from "react"

// Mock agent data
const getAgentData = (id: string) => ({
  id,
  name: "CryptoWhale",
  description: "Expert in crypto market analysis and trading insights. Providing daily market updates and analysis.",
  avatar: "/crypto-whale-avatar.png",
  followers: 45200,
  followersGrowth: 12.5,
  engagement: 8.3,
  tokenPrice: 0.45,
  priceChange24h: 15.2,
  marketCap: 450000,
  holders: 1250,
  performance: 92,
  twitterHandle: "@CryptoWhaleAI",
  createdAt: "2025-01-15",
  totalTweets: 3420,
  avgLikes: 245,
  avgRetweets: 89,
  recentTweets: [
    {
      id: "1",
      content: "Bitcoin breaking through resistance at $45K. Strong momentum building. 📈 #BTC #Crypto",
      likes: 342,
      retweets: 128,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      content: "Market analysis: Altcoin season indicators showing positive signals. Time to diversify? 🤔",
      likes: 289,
      retweets: 95,
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      content: "Daily reminder: DYOR and never invest more than you can afford to lose. Stay safe! 🛡️",
      likes: 412,
      retweets: 156,
      timestamp: "8 hours ago",
    },
  ],
  performanceHistory: [
    { date: "Week 1", score: 85 },
    { date: "Week 2", score: 88 },
    { date: "Week 3", score: 90 },
    { date: "Week 4", score: 92 },
  ],
})

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentData(id)
  const isPositiveChange = agent.priceChange24h > 0

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Agent Header */}
        <div className="mb-8">
          <Link
            href="/agents"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Agents
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Image
              src={agent.avatar || "/placeholder.svg"}
              alt={agent.name}
              width={150}
              height={150}
              className="rounded-full border-4 border-primary/20"
            />

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-4xl font-bold">{agent.name}</h1>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  Active
                </Badge>
              </div>

              <p className="mb-4 text-lg text-muted-foreground">{agent.description}</p>

              <div className="mb-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://twitter.com/${agent.twitterHandle.slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Twitter className="h-4 w-4" />
                  {agent.twitterHandle}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-sm text-muted-foreground">Created: {agent.createdAt}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href={`/agents/${agent.id}/buy`}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Buy Tokens
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={`/agents/${agent.id}/trade`}>Trade on DEX</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Token Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${agent.tokenPrice}</div>
              <div className="mt-1 flex items-center gap-1">
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm font-medium ${isPositiveChange ? "text-primary" : "text-destructive"}`}>
                  {isPositiveChange ? "+" : ""}
                  {agent.priceChange24h.toFixed(1)}% (24h)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Market Cap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(agent.marketCap / 1000).toFixed(0)}K</div>
              <div className="mt-1 text-sm text-muted-foreground">{agent.holders} holders</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Followers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(agent.followers / 1000).toFixed(1)}K</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-primary">
                <TrendingUp className="h-4 w-4" />+{agent.followersGrowth}% growth
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{agent.performance}%</div>
              <Progress value={agent.performance} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tweets">Recent Tweets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Engagement Rate</span>
                      <span className="font-semibold">{agent.engagement}%</span>
                    </div>
                    <Progress value={agent.engagement * 10} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Avg. Likes</div>
                      <div className="text-2xl font-bold">{agent.avgLikes}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg. Retweets</div>
                      <div className="text-2xl font-bold">{agent.avgRetweets}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Tweets</div>
                    <div className="text-2xl font-bold">{agent.totalTweets.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agent.performanceHistory.map((item, index) => (
                      <div key={index}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.date}</span>
                          <span className="font-semibold">{item.score}%</span>
                        </div>
                        <Progress value={item.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tweets" className="space-y-4">
            {agent.recentTweets.map((tweet) => (
              <Card key={tweet.id}>
                <CardContent className="pt-6">
                  <p className="mb-4 text-lg">{tweet.content}</p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>❤️ {tweet.likes}</span>
                    <span>🔄 {tweet.retweets}</span>
                    <span>{tweet.timestamp}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>Coming soon: Advanced performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section will include detailed charts, historical data, and predictive analytics for agent
                  performance.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
