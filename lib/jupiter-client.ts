"use client"

import { Connection, type PublicKey, type Transaction, VersionedTransaction } from "@solana/web3.js"

export interface JupiterQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: number
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
  }>
}

export interface JupiterSwapResult {
  txid: string
  inputAmount: number
  outputAmount: number
}

export class JupiterClient {
  private connection: Connection
  private baseUrl = "https://quote-api.jup.ag/v6"

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl)
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps = 50,
  ): Promise<JupiterQuote | null> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
      })

      const response = await fetch(`${this.baseUrl}/quote?${params}`)
      if (!response.ok) {
        console.error("[v0] Jupiter quote failed:", response.statusText)
        return null
      }

      const quote = await response.json()
      return quote
    } catch (error) {
      console.error("[v0] Error fetching Jupiter quote:", error)
      return null
    }
  }

  async getSwapTransaction(quote: JupiterQuote, userPublicKey: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey,
          wrapAndUnwrapSol: true,
        }),
      })

      if (!response.ok) {
        console.error("[v0] Jupiter swap transaction failed:", response.statusText)
        return null
      }

      const { swapTransaction } = await response.json()
      return swapTransaction
    } catch (error) {
      console.error("[v0] Error getting swap transaction:", error)
      return null
    }
  }

  async executeSwap(
    swapTransaction: string,
    wallet: {
      signTransaction: (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
      publicKey: PublicKey
    },
  ): Promise<string | null> {
    try {
      const transactionBuf = Buffer.from(swapTransaction, "base64")
      const transaction = VersionedTransaction.deserialize(transactionBuf)

      const signedTransaction = await wallet.signTransaction(transaction)

      const rawTransaction = signedTransaction.serialize()
      const txid = await this.connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      })

      await this.connection.confirmTransaction(txid)
      return txid
    } catch (error) {
      console.error("[v0] Error executing swap:", error)
      return null
    }
  }
}

// Helper function to format token amounts
export function formatTokenAmount(amount: string, decimals: number): number {
  return Number.parseInt(amount) / Math.pow(10, decimals)
}

// SOL mint address
export const SOL_MINT = "So11111111111111111111111111111111111111112"
