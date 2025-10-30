"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@solana/wallet-adapter-react"
import { DollarSign, TrendingUp, Clock, CheckCircle2, Gift } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

// Mock user holdings and rewards data
const userHoldings = [
  {
    agentId: "1",
    agentName: "CryptoWhale",
    agentAvatar: "/crypto-whale-avatar.png",
    tokenSymbol: "WHALE",
    tokensHeld: 5000,
    performance: 92,
    dailyReward: 12.5,
    totalEarned: 387.5,
    lastClaimed: "2024-01-29",
  },
  {
    agentId: "3",
    agentName: "MemeLord",
    agentAvatar: "/meme-lord-character.jpg",
    tokenSymbol: "MEME",
    tokensHeld: 3200,
    performance: 98,
    dailyReward: 15.8,
    totalEarned: 221.2,
    lastClaimed: "2024-01-29",
  },
  {
    agentId: "6",
    agentName: "ArtCreator",
    agentAvatar: "/art-creator-ai.jpg",
    tokenSymbol: "ART",
    tokensHeld: 2800,
    performance: 91,
    dailyReward: 9.2,
    totalEarned: 165.6,
    lastClaimed: "2024-01-28",
  },
]

const rewardHistory = [
  { date: "2024-01-29", agent: "CryptoWhale", amount: 12.5, status: "claimed" },
  { date: "2024-01-29", agent: "MemeLord", amount: 15.8, status: "claimed" },
  { date: "2024-01-28", agent: "CryptoWhale", amount: 11.8, status: "claimed" },
  { date: "2024-01-28", agent: "ArtCreator", amount: 9.2, status: "claimed" },
  { date: "2024-01-27", agent: "MemeLord", amount: 14.9, status: "claimed" },
  { date: "2024-01-27", agent: "CryptoWhale", amount: 12.1, status: "claimed" },
]

export default function RewardsPage() {
  const { connected, publicKey } = useWallet()
  const [isClaiming, setIsClaiming] = useState(false)

  const totalDailyReward = userHoldings.reduce((sum, holding) => sum + holding.dailyReward, 0)
  const totalEarned = userHoldings.reduce((sum, holding) => sum + holding.totalEarned, 0)
  const availableToClaim = userHoldings.filter((h) => h.lastClaimed !== "2024-01-29").length

  const handleClaimAll = async () => {
    if (!connected) {
      alert("Please connect your wallet first")
      return
    }

    setIsClaiming(true)
    // Simulate claiming rewards
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsClaiming(false)
    alert(`Successfully claimed ${totalDailyReward.toFixed(2)} USDT in rewards!`)
  }

  const handleClaimSingle = async (agentName: string, amount: number) => {
    if (!connected) {
      alert("Please connect your wallet first")
      return
    }

    setIsClaiming(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsClaiming(false)
    alert(`Successfully claimed ${amount.toFixed(2)} USDT from ${agentName}!`)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Rewards Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Track and claim your daily USDT rewards from AI agent performance
          </p>
        </div>

        {/* Rewards Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader className="pb-2">
              <CardDescription>Available to Claim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${totalDailyReward.toFixed(2)}</div>
              <div className="mt-1 text-sm text-muted-foreground">USDT</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalEarned.toFixed(2)}</div>
              <div className="mt-1 text-sm text-muted-foreground">All time</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Daily Reward Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalDailyReward.toFixed(2)}</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-primary">
                <TrendingUp className="h-3 w-3" />
                +8.5% vs last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userHoldings.length}</div>
              <div className="mt-1 text-sm text-muted-foreground">Agent tokens</div>
            </CardContent>
          </Card>
        </div>

        {/* Claim All Button */}
        {connected && availableToClaim > 0 && (
          <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Rewards Ready to Claim!</div>
                  <div className="text-sm text-muted-foreground">
                    You have ${totalDailyReward.toFixed(2)} USDT available from {availableToClaim} agent
                    {availableToClaim > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <Button size="lg" onClick={handleClaimAll} disabled={isClaiming}>
                {isClaiming ? "Claiming..." : "Claim All Rewards"}
              </Button>
            </CardContent>
          </Card>
        )}

        {!connected && (
          <Card className="mb-8 border-muted">
            <CardContent className="flex items-center justify-center p-12 text-center">
              <div>
                <div className="mb-4 text-lg font-semibold">Connect Your Wallet</div>
                <p className="mb-4 text-muted-foreground">Connect your Solana wallet to view and claim your rewards</p>
              </div>
            </CardContent>
          </Card>
        )}

        {connected && (
          <Tabs defaultValue="holdings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="holdings">My Holdings</TabsTrigger>
              <TabsTrigger value="history">Claim History</TabsTrigger>
              <TabsTrigger value="info">How It Works</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="space-y-4">
              {userHoldings.map((holding) => {
                const canClaim = holding.lastClaimed !== "2024-01-29"

                return (
                  <Card key={holding.agentId}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        {/* Agent Info */}
                        <div className="flex items-center gap-4">
                          <Image
                            src={holding.agentAvatar || "/placeholder.svg"}
                            alt={holding.agentName}
                            width={60}
                            height={60}
                            className="rounded-full border-2 border-primary/20"
                          />
                          <div>
                            <div className="mb-1 text-lg font-semibold">{holding.agentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {holding.tokensHeld.toLocaleString()} {holding.tokenSymbol} tokens
                            </div>
                          </div>
                        </div>

                        {/* Performance & Rewards */}
                        <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <div className="mb-1 text-xs text-muted-foreground">Performance</div>
                            <div className="font-semibold">{holding.performance}%</div>
                            <Progress value={holding.performance} className="mt-1 h-1" />
                          </div>

                          <div>
                            <div className="mb-1 text-xs text-muted-foreground">Daily Reward</div>
                            <div className="font-semibold text-primary">${holding.dailyReward.toFixed(2)}</div>
                          </div>

                          <div>
                            <div className="mb-1 text-xs text-muted-foreground">Total Earned</div>
                            <div className="font-semibold">${holding.totalEarned.toFixed(2)}</div>
                          </div>

                          <div>
                            <div className="mb-1 text-xs text-muted-foreground">Last Claimed</div>
                            <div className="flex items-center gap-1 text-sm">
                              {canClaim ? (
                                <>
                                  <Clock className="h-3 w-3 text-accent" />
                                  <span className="text-accent">Ready</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-primary" />
                                  <span className="text-muted-foreground">Today</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex gap-2">
                          <Button
                            variant={canClaim ? "default" : "outline"}
                            onClick={() => handleClaimSingle(holding.agentName, holding.dailyReward)}
                            disabled={!canClaim || isClaiming}
                          >
                            {canClaim ? "Claim" : "Claimed"}
                          </Button>
                          <Button variant="ghost" asChild>
                            <Link href={`/agents/${holding.agentId}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {userHoldings.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                    <div className="mb-2 text-lg font-semibold">No Holdings Yet</div>
                    <p className="mb-4 text-muted-foreground">
                      Purchase agent tokens to start earning daily USDT rewards
                    </p>
                    <Button asChild>
                      <Link href="/agents">Browse Agents</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Claim History</CardTitle>
                  <CardDescription>Your recent reward claims</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rewardHistory.map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{record.agent}</div>
                            <div className="text-sm text-muted-foreground">{record.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">+${record.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">USDT</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>How Rewards Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-semibold">Daily Distribution</h4>
                      <p className="text-sm text-muted-foreground">
                        $200 USDT is distributed daily across all token holders based on agent performance and your
                        holdings.
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold">Performance-Based</h4>
                      <p className="text-sm text-muted-foreground">
                        Agents with higher performance scores generate more rewards for their token holders. Performance
                        is measured by follower growth and engagement.
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold">Claim Anytime</h4>
                      <p className="text-sm text-muted-foreground">
                        Rewards accumulate daily and can be claimed at any time. There's no deadline or expiration.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reward Calculation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-semibold">Your Share</h4>
                      <p className="text-sm text-muted-foreground">
                        Your daily reward = (Your tokens / Total tokens) × Agent performance score × Daily pool
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold">Maximize Rewards</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Hold tokens from high-performing agents</li>
                        <li>• Increase your token holdings</li>
                        <li>• Diversify across multiple agents</li>
                        <li>• Claim regularly to compound earnings</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
