"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useCallback, useEffect, useState } from "react"
import { getXGrowthSDK } from "./x-growth-sdk"
import { AnchorProvider } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"

export function useXGrowthProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [sdk, setSdk] = useState<ReturnType<typeof getXGrowthSDK> | null>(null)

  useEffect(() => {
    const sdkInstance = getXGrowthSDK()

    if (wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions) {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" })
      sdkInstance.setProvider(provider)
    }

    setSdk(sdkInstance)
  }, [connection, wallet])

  return sdk
}

export function useAgentData(agentId: string) {
  const sdk = useXGrowthProgram()
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAgent = useCallback(async () => {
    if (!sdk) return

    try {
      setLoading(true)
      const agentData = await sdk.getAgent(agentId)
      setAgent(agentData)
      setError(null)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [sdk, agentId])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  return { agent, loading, error, refetch: fetchAgent }
}

export function useUserRewards(agentId: string) {
  const sdk = useXGrowthProgram()
  const { publicKey } = useWallet()
  const [rewards, setRewards] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchRewards = useCallback(async () => {
    if (!sdk || !publicKey) return

    try {
      setLoading(true)
      const rewardsData = await sdk.getUserRewards(publicKey, agentId)
      setRewards(rewardsData)
    } catch (e) {
      console.error("Error fetching rewards:", e)
    } finally {
      setLoading(false)
    }
  }, [sdk, publicKey, agentId])

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  const claimRewards = useCallback(async () => {
    if (!sdk || !publicKey) throw new Error("Wallet not connected")

    const usdtMint = new PublicKey("USDT_MINT_ADDRESS") // Replace with actual USDT mint
    return await sdk.claimRewards(publicKey, agentId, usdtMint)
  }, [sdk, publicKey, agentId])

  return { rewards, loading, claimRewards, refetch: fetchRewards }
}

export function useBuyTokens(agentId: string) {
  const sdk = useXGrowthProgram()
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)

  const buyTokens = useCallback(
    async (usdtAmount: number, slippage = 1) => {
      if (!sdk || !publicKey) throw new Error("Wallet not connected")

      setLoading(true)
      try {
        // Calculate minimum tokens with slippage
        const agent = await sdk.getAgent(agentId)
        const tokensOut = sdk.calculateTokensOut(
          usdtAmount,
          agent.bondingCurve.basePrice.toNumber(),
          agent.circulatingSupply.toNumber(),
          agent.bondingCurve.maxSupply.toNumber(),
        )
        const minTokensOut = tokensOut * (1 - slippage / 100)

        const usdtMint = new PublicKey("USDT_MINT_ADDRESS") // Replace with actual USDT mint
        const tx = await sdk.buyFromCurve(publicKey, agentId, usdtAmount, Math.floor(minTokensOut), usdtMint)

        return tx
      } finally {
        setLoading(false)
      }
    },
    [sdk, publicKey, agentId],
  )

  return { buyTokens, loading }
}
