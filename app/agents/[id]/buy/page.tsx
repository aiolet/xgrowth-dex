"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@solana/wallet-adapter-react"
import { ArrowRight, Info, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use, useState } from "react"
import { BondingCurveChart } from "@/components/bonding-curve-chart"

// Mock agent data
const getAgentData = (id: string) => ({
  id,
  name: "CryptoWhale",
  avatar: "/crypto-whale-avatar.png",
  tokenPrice: 0.45,
  tokenSymbol: "WHALE",
  totalSupply: 1000000,
  circulatingSupply: 450000,
  bondingCurveProgress: 45,
})

export default function BuyTokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentData(id)
  const { connected, publicKey } = useWallet()

  const [solAmount, setSolAmount] = useState("1")
  const [tokenAmount, setTokenAmount] = useState("2222")
  const [slippage, setSlippage] = useState(1)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Bonding curve calculation (simplified)
  const calculateTokensFromSol = (sol: number) => {
    // Simple bonding curve: price increases with supply
    const basePrice = 0.00045 // SOL per token
    const tokens = sol / basePrice
    return Math.floor(tokens)
  }

  const calculateSolFromTokens = (tokens: number) => {
    const basePrice = 0.00045
    return (tokens * basePrice).toFixed(4)
  }

  const handleSolChange = (value: string) => {
    setSolAmount(value)
    const sol = Number.parseFloat(value) || 0
    const tokens = calculateTokensFromSol(sol)
    setTokenAmount(tokens.toString())
  }

  const handleTokenChange = (value: string) => {
    setTokenAmount(value)
    const tokens = Number.parseFloat(value) || 0
    const sol = calculateSolFromTokens(tokens)
    setSolAmount(sol)
  }

  const handlePurchase = async () => {
    if (!connected) {
      alert("Please connect your wallet first")
      return
    }

    setIsPurchasing(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsPurchasing(false)
    alert(`Successfully purchased ${tokenAmount} ${agent.tokenSymbol} tokens!`)
  }

  const priceImpact = ((Number.parseFloat(solAmount) / 100) * 2).toFixed(2) // Simplified calculation
  const platformFee = (Number.parseFloat(solAmount) * 0.01).toFixed(4)
  const totalCost = (Number.parseFloat(solAmount) + Number.parseFloat(platformFee)).toFixed(4)

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
          {/* Main Purchase Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Image
                    src={agent.avatar || "/placeholder.svg"}
                    alt={agent.name}
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-primary/20"
                  />
                  <div>
                    <CardTitle>Buy {agent.tokenSymbol} Tokens</CardTitle>
                    <CardDescription>Purchase via bonding curve</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Bonding Curve Progress */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Bonding Curve Progress</span>
                    <span className="text-sm font-bold text-primary">{agent.bondingCurveProgress}%</span>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                      style={{ width: `${agent.bondingCurveProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {agent.circulatingSupply.toLocaleString()} / {agent.totalSupply.toLocaleString()} tokens sold
                  </p>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sol-amount">You Pay (SOL)</Label>
                    <div className="relative mt-2">
                      <Input
                        id="sol-amount"
                        type="number"
                        value={solAmount}
                        onChange={(e) => handleSolChange(e.target.value)}
                        placeholder="0.0"
                        className="pr-16 text-lg"
                        step="0.1"
                        min="0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        SOL
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-2">
                      <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="token-amount">You Receive ({agent.tokenSymbol})</Label>
                    <div className="relative mt-2">
                      <Input
                        id="token-amount"
                        type="number"
                        value={tokenAmount}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        placeholder="0"
                        className="pr-20 text-lg"
                        step="1"
                        min="0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        {agent.tokenSymbol}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSolChange("0.5")}>
                    0.5 SOL
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSolChange("1")}>
                    1 SOL
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSolChange("5")}>
                    5 SOL
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSolChange("10")}>
                    10 SOL
                  </Button>
                </div>

                {/* Slippage Settings */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <Label>Slippage Tolerance</Label>
                    <span className="text-sm font-medium">{slippage}%</span>
                  </div>
                  <Slider value={[slippage]} onValueChange={(v) => setSlippage(v[0])} min={0.1} max={5} step={0.1} />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>0.1%</span>
                    <span>5%</span>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Price</span>
                    <span className="font-medium">${agent.tokenPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className="font-medium text-accent">{priceImpact}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (1%)</span>
                    <span className="font-medium">{platformFee} SOL</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost</span>
                      <span className="font-bold">{totalCost} SOL</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={!connected || isPurchasing || Number.parseFloat(solAmount) <= 0}
                >
                  {!connected
                    ? "Connect Wallet to Buy"
                    : isPurchasing
                      ? "Processing..."
                      : `Buy ${tokenAmount} ${agent.tokenSymbol}`}
                </Button>

                {connected && publicKey && (
                  <p className="text-center text-xs text-muted-foreground">
                    Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Bonding Curve Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <BondingCurveChart progress={agent.bondingCurveProgress} />
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-4 w-4" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="mb-1 font-semibold">Bonding Curve</h4>
                  <p className="text-muted-foreground">
                    Token price increases automatically as more tokens are purchased. Early buyers get better prices.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold">Instant Liquidity</h4>
                  <p className="text-muted-foreground">
                    Buy and sell anytime. The bonding curve ensures there's always liquidity available.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold">DEX Migration</h4>
                  <p className="text-muted-foreground">
                    Once the curve reaches 100%, tokens migrate to Jupiter DEX for open market trading.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Token Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="font-semibold">${agent.tokenPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">$450K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-semibold">$89K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holders</span>
                  <span className="font-semibold">1,250</span>
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
          </div>
        </div>
      </main>
    </div>
  )
}
