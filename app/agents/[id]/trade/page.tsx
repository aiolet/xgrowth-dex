"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@solana/wallet-adapter-react"
import { ArrowDownUp, ExternalLink, Info, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use, useState } from "react"

// Mock agent data
const getAgentData = (id: string) => ({
  id,
  name: "CryptoWhale",
  avatar: "/crypto-whale-avatar.png",
  tokenPrice: 0.45,
  tokenSymbol: "WHALE",
  tokenMint: "WHALExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Mock mint address
  liquidity: 125000,
  volume24h: 89000,
})

export default function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentData(id)
  const { connected, publicKey, signTransaction } = useWallet()

  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)

  const inputToken = tradeType === "buy" ? "SOL" : agent.tokenSymbol
  const outputToken = tradeType === "buy" ? agent.tokenSymbol : "SOL"

  const handleSwapDirection = () => {
    setTradeType(tradeType === "buy" ? "sell" : "buy")
    setInputAmount(outputAmount)
    setOutputAmount(inputAmount)
  }

  const handleInputChange = async (value: string) => {
    setInputAmount(value)

    if (!value || Number.parseFloat(value) <= 0) {
      setOutputAmount("")
      setPriceImpact(0)
      return
    }

    // Simulate quote fetching
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const input = Number.parseFloat(value)
    let output: number

    if (tradeType === "buy") {
      // Buying tokens with SOL
      output = input / agent.tokenPrice
      setPriceImpact((input / agent.liquidity) * 100)
    } else {
      // Selling tokens for SOL
      output = input * agent.tokenPrice
      setPriceImpact((output / agent.liquidity) * 100)
    }

    setOutputAmount(output.toFixed(4))
    setIsLoading(false)
  }

  const handleTrade = async () => {
    if (!connected || !publicKey || !signTransaction) {
      alert("Please connect your wallet first")
      return
    }

    setIsLoading(true)

    try {
      // In a real implementation, this would use the JupiterClient
      // const jupiterClient = new JupiterClient(process.env.NEXT_PUBLIC_RPC_URL!)
      // const quote = await jupiterClient.getQuote(...)
      // const swapTx = await jupiterClient.getSwapTransaction(...)
      // const txid = await jupiterClient.executeSwap(...)

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert(
        `Successfully ${tradeType === "buy" ? "bought" : "sold"} ${outputAmount} ${outputToken}!\n\nTransaction simulated.`,
      )
    } catch (error) {
      console.error("[v0] Trade error:", error)
      alert("Trade failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link
          href={`/agents/${agent.id}`}
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {agent.name}
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trading Interface */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={agent.avatar || "/placeholder.svg"}
                      alt={agent.name}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-primary/20"
                    />
                    <div>
                      <CardTitle>Trade {agent.tokenSymbol}</CardTitle>
                      <CardDescription>Powered by Jupiter DEX</CardDescription>
                    </div>
                  </div>
                  <a
                    href="https://jup.ag"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Jupiter
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as "buy" | "sell")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>

                  <TabsContent value={tradeType} className="space-y-4 pt-4">
                    {/* Input Token */}
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <Label className="text-xs text-muted-foreground">You Pay</Label>
                      <div className="mt-2 flex items-center justify-between">
                        <Input
                          type="number"
                          value={inputAmount}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder="0.0"
                          className="border-0 bg-transparent p-0 text-2xl font-semibold focus-visible:ring-0"
                          step="0.01"
                          min="0"
                        />
                        <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                          <span className="font-semibold">{inputToken}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {tradeType === "buy" ? "Balance: 10.5 SOL" : `Balance: 5,000 ${agent.tokenSymbol}`}
                      </div>
                    </div>

                    {/* Swap Direction Button */}
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-transparent"
                        onClick={handleSwapDirection}
                        disabled={isLoading}
                      >
                        <ArrowDownUp className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Output Token */}
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <Label className="text-xs text-muted-foreground">You Receive</Label>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-2xl font-semibold">{outputAmount || "0.0"}</div>
                        <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                          <span className="font-semibold">{outputToken}</span>
                        </div>
                      </div>
                      {outputAmount && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          ≈ ${(Number.parseFloat(outputAmount) * agent.tokenPrice).toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Trade Details */}
                    {inputAmount && outputAmount && (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-medium">
                            1 {inputToken} ={" "}
                            {(Number.parseFloat(outputAmount) / Number.parseFloat(inputAmount)).toFixed(4)}{" "}
                            {outputToken}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price Impact</span>
                          <span className={`font-medium ${priceImpact > 5 ? "text-destructive" : "text-accent"}`}>
                            {priceImpact.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Liquidity Provider Fee</span>
                          <span className="font-medium">0.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Minimum Received</span>
                          <span className="font-medium">
                            {(Number.parseFloat(outputAmount) * 0.99).toFixed(4)} {outputToken}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Trade Button */}
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleTrade}
                      disabled={!connected || isLoading || !inputAmount || Number.parseFloat(inputAmount) <= 0}
                    >
                      {!connected
                        ? "Connect Wallet"
                        : isLoading
                          ? "Loading..."
                          : `${tradeType === "buy" ? "Buy" : "Sell"} ${agent.tokenSymbol}`}
                    </Button>

                    {priceImpact > 5 && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <div className="flex items-start gap-2">
                          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <div>
                            <div className="font-semibold">High Price Impact</div>
                            <div className="text-xs">
                              This trade will significantly affect the token price. Consider trading a smaller amount.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "buy", amount: "2,500", price: "0.45", time: "2m ago" },
                    { type: "sell", amount: "1,800", price: "0.44", time: "5m ago" },
                    { type: "buy", amount: "3,200", price: "0.45", time: "8m ago" },
                  ].map((trade, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${
                            trade.type === "buy" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {trade.type.toUpperCase()}
                        </span>
                        <span>{trade.amount}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">${trade.price}</span>
                        <span className="text-muted-foreground">{trade.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Token Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Token Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">${agent.tokenPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-semibold">${(agent.volume24h / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liquidity</span>
                  <span className="font-semibold">${(agent.liquidity / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">24h Change</span>
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <TrendingUp className="h-3 w-3" />
                    +15.2%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Jupiter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-4 w-4" />
                  About Jupiter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Jupiter is Solana's leading DEX aggregator, finding the best routes and prices across all Solana DEXs.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Best price execution</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Low slippage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Deep liquidity</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
                  Price chart coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
