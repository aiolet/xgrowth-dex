# X‑Growth — Solana AI‑Agent Token Platform

X‑Growth is a Solana dApp + on‑chain program (Anchor) that lets you **mint, trade, and reward tokens tied to AI agents**.
Each agent has its own mint, a primary bonding‑curve market, and a daily USDT reward stream distributed to token holders based on performance (e.g., likes/views).

> This README documents the overall **architecture**, **account model**, and **end‑to‑end flows** (from the Anchor program to the Next.js app and SDK).

---

## 1) System Architecture (High‑level)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                 Frontend (Next.js)                            │
│  / (Home), /marketplace, /agents, /agents/[id], /agents/[id]/trade, /rewards │
│                                                                               │
│  • @solana/wallet‑adapter (Phantom, Solflare)                                 │
│  • X‑Growth SDK (lib/solana/x‑growth‑sdk.ts)                                  │
│  • Jupiter Quote Client (lib/jupiter-client.ts)                               │
│                                                                               │
│         ▲                                            │                        │
│         │ Anchor provider + wallet                   │ REST (quotes)          │
│         │                                            ▼                        │
│  ┌─────────────────┐                        ┌──────────────────────┐         │
│  │  X‑Growth SDK   │── RPC txns ───────────▶│   Solana RPC Node    │         │
│  └─────────────────┘                        └──────────────────────┘         │
│                 │                                     │                      │
└─────────────────┼─────────────────────────────────────┼──────────────────────┘
                  │                                     │
                  ▼                                     ▼
        ┌──────────────────────┐               ┌──────────────────────┐
        │  X‑Growth Program    │ (Anchor)      │ Jupiter Aggregator   │ (secondary swaps)
        │  programs/x-growth   │               │ (quote/tx building)  │
        └──────────────────────┘               └──────────────────────┘
                  │
                  ▼
        ┌──────────────────────┐      Token Program  ┌─────────────────────────┐
        │   PDA Accounts       │  <────────────────▶ │  USDT Mint / Agent Mint │
        │  Platform / Agent    │                    └─────────────────────────┘
        │  UserRewards …       │
        └──────────────────────┘
```

**Primary market:** bonding‑curve buy/sell directly against the program’s reserve accounts.  
**Secondary market:** optional swaps via Jupiter (DEX aggregator) from the UI.

---

## 2) On‑chain (Anchor) Program

**Location:** `programs/x-growth`  
**Program ID (dev placeholder):** `XGrowth11111111111111111111111111111111111`  
(Update to your deployed address in `Anchor.toml` + SDK.)

### 2.1 Accounts (PDA)

- **Platform**

  - `authority: Pubkey` — super‑admin for platform operations
  - `daily_reward_pool: u64` — e.g., 200 USDT/day (basis units of USDT mint)
  - `total_agents: u64`
  - `usdt_mint: Pubkey` — reward settlement mint
  - `oracle: Pubkey` — signer authorized to post performance metrics
  - `bump: u8`
  - **PDA:** `seeds = ["platform"]`
  - File: `programs/x-growth/src/state.rs`

- **Agent**

  - Key fields (from code + comments):
    - `agent_id: String` (unique id used in PDA seeds)
    - `authority: Pubkey` (agent owner/creator)
    - `token_mint: Pubkey` (agent’s SPL token mint)
    - `bonding_curve_params: { base_price: u64, curve_factor: u64, max_supply: u64 }`
    - Tracking fields: `initial_supply, total_supply, reserve_balance`
    - `performance_metrics` (e.g., likes/views totals)
    - `accumulated_rewards`, `last_distribution_ts`
    - `bump: u8`
  - **PDA:** `seeds = ["agent", agent_id.as_bytes()]`

- **UserRewards**
  - `user: Pubkey`
  - `agent: Pubkey`
  - `pending_rewards: u64`
  - `claimed_rewards: u64`
  - `last_claim: i64`
  - `bump: u8`
  - **PDA:** typically derived by `[b"user_rewards", user, agent]` (see IDL once generated)

> Exact `LEN` constants are defined in `state.rs` for Anchor account allocation.

### 2.2 Instructions

Files under `programs/x-growth/src/instructions/`:

- `initialize_platform.rs` — creates the Platform PDA and sets:
  - `authority`, `daily_reward_pool`, `usdt_mint`, `oracle`
- `create_agent.rs` — mints a new agent token, initializes bonding‑curve parameters, and registers the agent.
- `buy_from_curve.rs` — primary buy:
  - Transfers `USDT` from buyer → agent reserve
  - Mints agent tokens to buyer ATA
  - Enforces `max_supply` and optional slippage checks (`XGrowthError::SlippageExceeded`)
- `sell_to_curve.rs` — primary sell:
  - Burns agent tokens from seller
  - Pays USDT from reserve → seller
- `update_performance.rs` — **oracle‑only** update of agent metrics (likes/views)
- `distribute_rewards.rs` — splits the `daily_reward_pool` across agents/token‑holders:
  - Moves USDT from platform reserve to per‑user `UserRewards.pending_rewards`
- `claim_rewards.rs` — user pulls `pending_rewards` to their USDT ATA and updates `claimed_rewards`

### 2.3 Errors

See `programs/x-growth/src/errors.rs`:

- `SlippageExceeded`, `MaxSupplyReached`, `InsufficientReserve`, `UnauthorizedOracle`, `NoRewardsToClaim`, `InvalidBondingCurve`…

### 2.4 Bonding Curve (concept)

The program stores:

- `base_price`: starting price in USDT units
- `curve_factor`: steepness factor applied as supply grows/shrinks
- `max_supply`: hard cap to prevent runaway minting

> The exact math lives in the instruction handlers; keep UI slippage set conservatively to avoid `SlippageExceeded` on volatile steps.

---

## 3) Off‑chain App & SDK

### 3.1 Frontend (Next.js / React)

- **App routes:**  
  `app/` contains pages:
  - `/` (home), `/marketplace`, `/agents`, `/agents/[id]`, `/agents/[id]/trade`, `/rewards`
- **Wallets:** `lib/wallet-provider.tsx` wires `@solana/wallet-adapter` for Phantom/Solflare.
- **UI components:** under `components/` (shadcn‑ui style).

### 3.2 X‑Growth SDK

- **File:** `lib/solana/x-growth-sdk.ts`
- Provides:
  - Connection bootstrap and (future) Anchor `Program` binding
  - PDA helpers: e.g., `getPlatformPDA()`, `getAgentPDA(agentId)`
  - High‑level flows (initialize platform, create agent, buy/sell, distribute/claim)
- **Program ID:** update `PROGRAM_ID` to your deployed address.

### 3.3 Jupiter Client (secondary swaps)

- **File:** `lib/jupiter-client.ts`
- Fetches quotes from `https://quote-api.jup.ag/v6` and can submit returned transactions.
- Used by the UI to provide secondary‑market routing beyond the primary curve.

---

## 4) Key Flows (End‑to‑End)

### 4.1 Initialize Platform (Admin)

1. Admin wallet calls `initialize_platform` with:
   - `daily_reward_pool` (e.g., `200 * 10^decimals(USDT)`)
   - `usdt_mint` and `oracle` pubkeys
2. Program creates `Platform` PDA and records bumps/authority.

**From SDK (pseudo‑TS):**

```ts
const sdk = new XGrowthSDK(rpcUrl).setProvider(anchorProvider);
await sdk.initializePlatform({
  dailyRewardPool: new BN(200_000000), // if USDT has 6 decimals
  usdtMint,
  oracle,
});
```

### 4.2 Create Agent

1. Creator chooses `agent_id`, `name`, `symbol`, `uri`, `initial_supply`, and `bonding_curve_params`.
2. Program:
   - Creates `Agent` PDA
   - Creates SPL mint for the agent
   - (Optionally) mints `initial_supply` to creator/reserve depending on design
3. Frontend lists the agent on `/agents/[id]` (mock data exists until IDL wiring).

### 4.3 Primary Buy (Bonding Curve)

1. Buyer approves transfer of `USDT` → reserve
2. Program mints agent tokens to buyer ATA using curve price for the step
3. Enforces `max_supply`; fails if `SlippageExceeded`

### 4.4 Primary Sell (Bonding Curve)

1. Seller’s tokens are burned
2. Program sends `USDT` from reserve back to seller per curve price for the step

### 4.5 Update Performance (Oracle)

- Off‑chain agent metrics (Twitter likes/views) are posted by the authorized `oracle` signer via `update_performance`.

### 4.6 Distribute Rewards (Admin/Crank)

- Periodically (e.g., daily), call `distribute_rewards` to allocate `daily_reward_pool` proportionally to holders per agent.
- Credits `UserRewards.pending_rewards` for users.

### 4.7 Claim Rewards (User)

- User invokes `claim_rewards` to pull accumulated USDT into their wallet.
- Updates `claimed_rewards` / `last_claim`.

---

## 5) Project Structure

```
x-growth-solana/
├─ Anchor.toml
├─ programs/
│  └─ x-growth/
│     ├─ Cargo.toml
│     └─ src/
│        ├─ lib.rs
│        ├─ state.rs
│        ├─ errors.rs
│        └─ instructions/
│           ├─ initialize_platform.rs
│           ├─ create_agent.rs
│           ├─ buy_from_curve.rs
│           ├─ sell_to_curve.rs
│           ├─ update_performance.rs
│           ├─ distribute_rewards.rs
│           └─ claim_rewards.rs
├─ app/                      # Next.js (App Router)
│  ├─ layout.tsx, page.tsx, globals.css
│  ├─ marketplace/, agents/, rewards/, agents/[id]/trade, ...
├─ lib/
│  ├─ solana/x-growth-sdk.ts
│  ├─ jupiter-client.ts
│  └─ wallet-provider.tsx
├─ components/, hooks/, styles/, public/
├─ scripts/deploy-contracts.ts
├─ package.json, tsconfig.json, postcss.config.mjs, next.config.mjs
└─ README.md, DEPLOYMENT.md
```

---

## 6) Local Development & Deployment

### 6.1 Prerequisites

- **Solana CLI** ≥ 1.18
- **Anchor** ≥ 0.29
- **Rust** (nightly toolchain managed by Anchor)
- **Node 18+** and **pnpm** (or npm/yarn)

### 6.2 Configure Program IDs

- `Anchor.toml` currently points to localnet with a placeholder:
  ```toml
  [programs.localnet]
  x_growth = "XGrowth11111111111111111111111111111111111"
  ```
- After deploying, replace this with your **actual** program ID and update `PROGRAM_ID` in `lib/solana/x-growth-sdk.ts`.

### 6.3 Run Localnet (optional)

```bash
solana-test-validator -r
anchor build
anchor deploy
```

### 6.4 Frontend .env

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
# Deployer key ONLY for local scripts — do not commit
DEPLOYER_PRIVATE_KEY=[1,2,3,...]    # JSON array (Uint8Array) of secret key
```

### 6.5 Deploy script (TypeScript)

`scripts/deploy-contracts.ts` reads `DEPLOYER_PRIVATE_KEY` and performs basic setup (logs truncated in repo). Example invocation:

```bash
pnpm ts-node scripts/deploy-contracts.ts
```

> For production, prefer `anchor deploy` with a proper keypair file and CI pipeline.

### 6.6 Run the App

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

Connect Phantom/Solflare and interact with the mocked agent pages (`/agents/[id]/trade`).  
Wire up actual IDL + RPC calls by initializing the Anchor `Program` instance in the SDK.

---

## 7) SDK Integration (examples)

> These are **illustrative** until the IDL is generated and imported.

```ts
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { XGrowthSDK } from "@/lib/solana/x-growth-sdk";

const sdk = new XGrowthSDK(process.env.NEXT_PUBLIC_RPC_URL!).setProvider(
  anchorProvider
);

// 1) Initialize platform (admin)
await sdk.initializePlatform({
  dailyRewardPool: new BN(200_000000), // USDT 6 decimals
  usdtMint,
  oracle,
});

// 2) Create agent
await sdk.createAgent({
  agentId: "whale-01",
  name: "Crypto Whale",
  symbol: "WHALE",
  uri: "ipfs://...",
  initialSupply: new BN(100_000_000000), // adjust decimals
  curve: {
    basePrice: new BN(1_000000),
    curveFactor: new BN(10_000),
    maxSupply: new BN(1_000_000_000000),
  },
});

// 3) Buy tokens from curve
await sdk.buyFromCurve({
  agentId: "whale-01",
  usdtAmount: new BN(50_000000),
  minTokensOut: new BN(0), // set slippage carefully
});
```

---

## 8) Security & Operational Notes

- **Oracle authority:** only the `oracle` key can call `update_performance`. Rotate via admin flow if compromised.
- **Custody:** reward USDT must be funded into the **platform reserve**; agent reserves need enough USDT liquidity for sells.
- **Slippage:** front‑end should compute conservative `min_tokens_out` / `max_usdt_in` to avoid failures.
- **Max Supply:** enforced on primary buys; consider secondary liquidity via DEX once supply stabilizes.
- **Upgradability:** Anchor program ID + upgrade authority should be carefully managed. Use a timelocked multisig in production.

---

## 9) Troubleshooting

- **`SlippageExceeded`**: relax slippage or re‑quote at current curve step.
- **`MaxSupplyReached`**: adjust curve or create a new agent with higher cap.
- **`InsufficientReserve` (sell)**: admin must top up USDT reserve.
- **Wallet adapter not connecting**: ensure Phantom/Solflare on the same cluster as `NEXT_PUBLIC_RPC_URL`.

---

## 10) Next Steps

- Generate & ship the **IDL**, then bind the SDK with `new Program(IDL, PROGRAM_ID, provider)`.
- Replace mock agent data in `app/agents/[id]/trade/page.tsx` with on‑chain fetches.
- Add cron/keeper to trigger `distribute_rewards` daily.
- Indexer for performance/holders to power marketplace charts and analytics.
