"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-lg font-bold text-primary-foreground">X</span>
          </div>
          <span className="text-xl font-bold">X-Growth</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/agents"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Agents
          </Link>
          <Link
            href="/rewards"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Rewards
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Marketplace
          </Link>
        </nav>

        <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
      </div>
    </header>
  )
}
