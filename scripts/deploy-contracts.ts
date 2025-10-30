import { AnchorProvider, BN } from "@coral-xyz/anchor"
import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { getXGrowthSDK } from "../lib/solana/x-growth-sdk"

async function main() {
  console.log("🚀 Starting X-Growth deployment...")

  // Setup connection
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"
  const connection = new Connection(rpcUrl, "confirmed")

  // Load wallet (you should have a keypair file)
  const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.DEPLOYER_PRIVATE_KEY || "[]")))

  console.log("📝 Deployer wallet:", wallet.publicKey.toString())

  // Initialize SDK
  const sdk = getXGrowthSDK()
  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: "confirmed",
  })
  sdk.setProvider(provider)

  // USDT mint address (use devnet USDT or create your own)
  const usdtMint = new PublicKey("USDT_MINT_ADDRESS_HERE")

  // Oracle address (can be same as deployer for testing)
  const oracle = wallet.publicKey

  // Daily reward pool: 200 USDT (with 6 decimals)
  const dailyRewardPool = 200 * 1_000_000

  console.log("🏗️  Initializing platform...")
  const initTx = await sdk.initializePlatform(wallet.publicKey, usdtMint, oracle, dailyRewardPool)
  console.log("✅ Platform initialized:", initTx)

  // Create sample agents
  const agents = [
    {
      id: "crypto-whale-01",
      name: "Crypto Whale Hunter",
      symbol: "WHALE",
      uri: "https://x-growth.com/agents/crypto-whale",
      initialSupply: 1_000_000_000_000_000, // 1M tokens with 9 decimals
      bondingCurve: {
        basePrice: new BN(10_000), // 0.01 USDT
        curveFactor: new BN(1_000_000),
        maxSupply: new BN(300_000_000_000_000), // 300K tokens
      },
    },
    {
      id: "tech-guru-02",
      name: "Tech Guru AI",
      symbol: "TECH",
      uri: "https://x-growth.com/agents/tech-guru",
      initialSupply: 1_000_000_000_000_000,
      bondingCurve: {
        basePrice: new BN(10_000),
        curveFactor: new BN(1_000_000),
        maxSupply: new BN(300_000_000_000_000),
      },
    },
  ]

  for (const agent of agents) {
    console.log(`🤖 Creating agent: ${agent.name}...`)
    const { tx, agentPDA, tokenMintPDA } = await sdk.createAgent(
      wallet.publicKey,
      agent.id,
      agent.name,
      agent.symbol,
      agent.uri,
      agent.initialSupply.toNumber(),
      agent.bondingCurve,
    )
    console.log(`✅ Agent created: ${agent.name}`)
    console.log(`   Agent PDA: ${agentPDA.toString()}`)
    console.log(`   Token Mint: ${tokenMintPDA.toString()}`)
    console.log(`   TX: ${tx}`)
  }

  console.log("🎉 Deployment complete!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
