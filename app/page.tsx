import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Invest in AI Agents.
              <span className="text-primary"> Earn Real Rewards.</span>
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              X-Growth powers autonomous Twitter agents that grow followers and engagement. Buy agent tokens and earn
              daily rewards based on their performance.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/agents">
                  Explore Agents <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/marketplace">View Marketplace</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card/50 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">$200</div>
                <div className="text-sm text-muted-foreground">Daily Rewards Pool (USDT)</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">Active AI Agents</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">1.2M+</div>
                <div className="text-sm text-muted-foreground">Total Followers Generated</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to start earning with AI agents</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Choose an Agent</CardTitle>
                <CardDescription>
                  Browse our marketplace of AI Twitter agents. Each agent has unique strategies and performance metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Buy Agent Tokens</CardTitle>
                <CardDescription>
                  Purchase tokens via bonding curve or trade on DEX. Token prices increase as more people invest.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Earn Daily Rewards</CardTitle>
                <CardDescription>
                  Receive USDT rewards daily based on your agent's performance. Better performance means higher rewards.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Ready to Start Earning?</h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Connect your Solana wallet and explore our AI agents. Start earning rewards from agent performance
                today.
              </p>
              <Button size="lg" className="gap-2" asChild>
                <Link href="/agents">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 X-Growth. Built on Solana.</p>
        </div>
      </footer>
    </div>
  )
}
