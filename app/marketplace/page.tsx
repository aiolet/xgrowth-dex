"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock marketplace data
const trendingTokens = [
  {
    id: "3",
    name: "MemeLord",
    symbol: "MEME",
    avatar: "/meme-lord-character.jpg",
    price: 0.78,
    change24h: 28.9,
    volume24h: 156000,
    marketCap: 780000,
  },
  {
    id: "6",
    name: "ArtCreator",
    symbol: "ART",
    avatar: "/art-creator-ai.jpg",
    price: 0.52,
    change24h: 19.3,
    volume24h: 98000,
    marketCap: 520000,
  },
  {
    id: "1",
    name: "CryptoWhale",
    symbol: "WHALE",
    avatar: "/crypto-whale-avatar.png",
    price: 0.45,
    change24h: 15.2,
    volume24h: 89000,
    marketCap: 450000,
  },
]

const recentTrades = [
  {
    id: "1",
    type: "buy",
    agent: "MemeLord",
    amount: 5000,
    price: 0.78,
    total: 3900,
    time: "2 min ago",
  },
  {
    id: "2",
    type: "sell",
    agent: "CryptoWhale",
    amount: 2200,
    price: 0.45,
    total: 990,
    time: "5 min ago",
  },
  {
    id: "3",
    type: "buy",
    agent: "ArtCreator",
    amount: 3500,
    price: 0.52,
    total: 1820,
    time: "8 min ago",
  },
  {
    id: "4",
    type: "buy",
    agent: "TechGuru",
    amount: 4100,
    price: 0.32,
    total: 1312,
    time: "12 min ago",
  },
  {
    id: "5",
    type: "sell",
    agent: "FitnessAI",
    amount: 1800,
    price: 0.41,
    total: 738,
    time: "15 min ago",
  },
]

export default function MarketplacePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Token Marketplace</h1>
          <p className="text-lg text-muted-foreground">Trade AI agent tokens and track market activity</p>
        </div>

        {/* Market Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Volume (24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$542K</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-primary">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Market Cap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3.2M</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-primary">
                <TrendingUp className="h-3 w-3" />
                +8.3%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Traders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <div className="mt-1 text-sm text-muted-foreground">Last 24h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,921</div>
              <div className="mt-1 text-sm text-muted-foreground">Last 24h</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recent Trades</TabsTrigger>
            <TabsTrigger value="all">All Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Tokens</CardTitle>
                <CardDescription>Highest gainers in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingTokens.map((token, index) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          #{index + 1}
                        </div>
                        <Image
                          src={token.avatar || "/placeholder.svg"}
                          alt={token.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-semibold">{token.name}</div>
                          <div className="text-sm text-muted-foreground">{token.symbol}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="font-semibold">${token.price}</div>
                          <div className="flex items-center gap-1 text-sm text-primary">
                            <TrendingUp className="h-3 w-3" />+{token.change24h}%
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Volume</div>
                          <div className="font-semibold">${(token.volume24h / 1000).toFixed(0)}K</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Market Cap</div>
                          <div className="font-semibold">${(token.marketCap / 1000).toFixed(0)}K</div>
                        </div>

                        <Button asChild>
                          <Link href={`/agents/${token.id}/buy`}>Trade</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Live trading activity across all agent tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            trade.type === "buy" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {trade.type.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{trade.agent}</div>
                          <div className="text-sm text-muted-foreground">{trade.time}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <div className="text-muted-foreground">Amount</div>
                          <div className="font-semibold">{trade.amount.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-semibold">${trade.price}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-semibold">${trade.total.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Tokens</CardTitle>
                <CardDescription>Browse all available agent tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <p>View all tokens in the Agents page</p>
                  <Button asChild className="mt-4">
                    <Link href="/agents">Browse All Agents</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
