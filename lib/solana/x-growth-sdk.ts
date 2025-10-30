import { type Program, type AnchorProvider, BN } from "@coral-xyz/anchor"
import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token"

// Program ID - replace with your deployed program ID
export const PROGRAM_ID = new PublicKey("XGrowth11111111111111111111111111111111111")

export interface BondingCurveParams {
  basePrice: BN
  curveFactor: BN
  maxSupply: BN
}

export interface PerformanceMetrics {
  totalLikes: BN
  totalViews: BN
  totalComments: BN
  totalFollowers: BN
  lastUpdated: BN
  dailyLikes: BN
  dailyViews: BN
  dailyComments: BN
  dailyNewFollowers: BN
}

export class XGrowthSDK {
  private connection: Connection
  private provider: AnchorProvider | null = null
  private program: Program | null = null

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, "confirmed")
  }

  setProvider(provider: AnchorProvider) {
    this.provider = provider
    // In production, load the IDL from the deployed program
    // this.program = new Program(IDL, PROGRAM_ID, provider);
  }

  // PDA helpers
  getPlatformPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("platform")], PROGRAM_ID)
  }

  getAgentPDA(agentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("agent"), Buffer.from(agentId)], PROGRAM_ID)
  }

  getTokenMintPDA(agentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("token_mint"), Buffer.from(agentId)], PROGRAM_ID)
  }

  getReservePDA(agentPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from("reserve"), agentPubkey.toBuffer()], PROGRAM_ID)
  }

  getUserRewardsPDA(user: PublicKey, agent: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_rewards"), user.toBuffer(), agent.toBuffer()],
      PROGRAM_ID,
    )
  }

  // Initialize platform
  async initializePlatform(authority: PublicKey, usdtMint: PublicKey, oracle: PublicKey, dailyRewardPool: number) {
    if (!this.program) throw new Error("Provider not set")

    const [platformPDA] = this.getPlatformPDA()

    const tx = await this.program.methods
      .initializePlatform(new BN(dailyRewardPool))
      .accounts({
        platform: platformPDA,
        authority,
        usdtMint,
        oracle,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    return tx
  }

  // Create agent
  async createAgent(
    authority: PublicKey,
    agentId: string,
    name: string,
    symbol: string,
    uri: string,
    initialSupply: number,
    bondingCurveParams: BondingCurveParams,
  ) {
    if (!this.program) throw new Error("Provider not set")

    const [platformPDA] = this.getPlatformPDA()
    const [agentPDA] = this.getAgentPDA(agentId)
    const [tokenMintPDA] = this.getTokenMintPDA(agentId)

    const tx = await this.program.methods
      .createAgent(agentId, name, symbol, uri, new BN(initialSupply), bondingCurveParams)
      .accounts({
        platform: platformPDA,
        agent: agentPDA,
        tokenMint: tokenMintPDA,
        authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc()

    return { tx, agentPDA, tokenMintPDA }
  }

  // Buy from bonding curve
  async buyFromCurve(buyer: PublicKey, agentId: string, usdtAmount: number, minTokensOut: number, usdtMint: PublicKey) {
    if (!this.program) throw new Error("Provider not set")

    const [platformPDA] = this.getPlatformPDA()
    const [agentPDA] = this.getAgentPDA(agentId)
    const [tokenMintPDA] = this.getTokenMintPDA(agentId)
    const [reservePDA] = this.getReservePDA(agentPDA)

    const buyerTokenAccount = await getAssociatedTokenAddress(tokenMintPDA, buyer)

    const buyerUsdtAccount = await getAssociatedTokenAddress(usdtMint, buyer)

    const reserveUsdtAccount = await getAssociatedTokenAddress(usdtMint, reservePDA, true)

    const tx = await this.program.methods
      .buyFromCurve(new BN(usdtAmount), new BN(minTokensOut))
      .accounts({
        agent: agentPDA,
        tokenMint: tokenMintPDA,
        buyerTokenAccount,
        buyerUsdtAccount,
        reserveUsdtAccount,
        platform: platformPDA,
        buyer,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    return tx
  }

  // Calculate price from bonding curve
  calculatePrice(basePrice: number, currentSupply: number, maxSupply: number): number {
    const supplyRatio = currentSupply / maxSupply
    const priceMultiplier = 1 + supplyRatio
    return basePrice * Math.pow(priceMultiplier, 2)
  }

  // Calculate tokens out for USDT amount
  calculateTokensOut(usdtAmount: number, basePrice: number, currentSupply: number, maxSupply: number): number {
    const avgPrice = this.calculatePrice(basePrice, currentSupply, maxSupply)
    return usdtAmount / avgPrice
  }

  // Update performance (oracle only)
  async updatePerformance(
    oracle: PublicKey,
    agentId: string,
    likes: number,
    views: number,
    comments: number,
    newFollowers: number,
  ) {
    if (!this.program) throw new Error("Provider not set")

    const [platformPDA] = this.getPlatformPDA()
    const [agentPDA] = this.getAgentPDA(agentId)

    const tx = await this.program.methods
      .updatePerformance(new BN(likes), new BN(views), new BN(comments), new BN(newFollowers))
      .accounts({
        agent: agentPDA,
        platform: platformPDA,
        oracle,
      })
      .rpc()

    return tx
  }

  // Claim rewards
  async claimRewards(user: PublicKey, agentId: string, usdtMint: PublicKey) {
    if (!this.program) throw new Error("Provider not set")

    const [platformPDA] = this.getPlatformPDA()
    const [agentPDA] = this.getAgentPDA(agentId)
    const [userRewardsPDA] = this.getUserRewardsPDA(user, agentPDA)

    const userUsdtAccount = await getAssociatedTokenAddress(usdtMint, user)

    const [rewardPoolPDA] = PublicKey.findProgramAddressSync([Buffer.from("reward_pool")], PROGRAM_ID)

    const tx = await this.program.methods
      .claimRewards()
      .accounts({
        agent: agentPDA,
        userRewards: userRewardsPDA,
        userUsdtAccount,
        rewardPool: rewardPoolPDA,
        platform: platformPDA,
        user,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    return tx
  }

  // Fetch agent data
  async getAgent(agentId: string) {
    if (!this.program) throw new Error("Provider not set")

    const [agentPDA] = this.getAgentPDA(agentId)
    const agentAccount = await this.program.account.agent.fetch(agentPDA)
    return agentAccount
  }

  // Fetch platform data
  async getPlatform() {
    if (!this.program) throw new Error("Provider not set")

    const [platformPDA] = this.getPlatformPDA()
    const platformAccount = await this.program.account.platform.fetch(platformPDA)
    return platformAccount
  }

  // Fetch user rewards
  async getUserRewards(user: PublicKey, agentId: string) {
    if (!this.program) throw new Error("Provider not set")

    const [agentPDA] = this.getAgentPDA(agentId)
    const [userRewardsPDA] = this.getUserRewardsPDA(user, agentPDA)

    try {
      const userRewardsAccount = await this.program.account.userRewards.fetch(userRewardsPDA)
      return userRewardsAccount
    } catch (e) {
      // Account doesn't exist yet
      return null
    }
  }
}

// Singleton instance
let sdkInstance: XGrowthSDK | null = null

export function getXGrowthSDK(): XGrowthSDK {
  if (!sdkInstance) {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"
    sdkInstance = new XGrowthSDK(rpcUrl)
  }
  return sdkInstance
}
