# X-Growth Solana Deployment Guide

## Prerequisites

1. Install Rust and Solana CLI:
\`\`\`bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
\`\`\`

2. Install Anchor:
\`\`\`bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
\`\`\`

3. Create Solana wallet:
\`\`\`bash
solana-keygen new --outfile ~/.config/solana/id.json
\`\`\`

4. Get devnet SOL:
\`\`\`bash
solana airdrop 2 --url devnet
\`\`\`

## Build and Deploy

1. Build the program:
\`\`\`bash
anchor build
\`\`\`

2. Get your program ID:
\`\`\`bash
solana address -k target/deploy/x_growth-keypair.json
\`\`\`

3. Update the program ID in:
   - `programs/x-growth/src/lib.rs` (declare_id!)
   - `Anchor.toml` (programs.localnet)
   - `lib/solana/x-growth-sdk.ts` (PROGRAM_ID)

4. Rebuild after updating IDs:
\`\`\`bash
anchor build
\`\`\`

5. Deploy to devnet:
\`\`\`bash
anchor deploy --provider.cluster devnet
\`\`\`

6. Initialize the platform:
\`\`\`bash
# Set your deployer private key
export DEPLOYER_PRIVATE_KEY='[your,private,key,array]'
export NEXT_PUBLIC_RPC_URL='https://api.devnet.solana.com'

# Run deployment script
npm run deploy:contracts
\`\`\`

## Environment Variables

Add to your `.env.local`:

\`\`\`env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YourDeployedProgramID
NEXT_PUBLIC_USDT_MINT=USDTMintAddress
\`\`\`

## Testing

Run Anchor tests:
\`\`\`bash
anchor test
\`\`\`

## Mainnet Deployment

1. Switch to mainnet:
\`\`\`bash
solana config set --url mainnet-beta
\`\`\`

2. Ensure you have enough SOL for deployment (~5 SOL)

3. Deploy:
\`\`\`bash
anchor deploy --provider.cluster mainnet
\`\`\`

4. Update environment variables to use mainnet RPC

## Security Checklist

- [ ] Smart contract audited
- [ ] Program upgrade authority transferred to multisig
- [ ] Oracle key secured
- [ ] Rate limiting implemented
- [ ] Emergency pause mechanism tested
- [ ] Reward pool funded
- [ ] All PDAs verified

## Monitoring

Monitor your program:
\`\`\`bash
solana program show <PROGRAM_ID> --url mainnet-beta
\`\`\`

Check logs:
\`\`\`bash
solana logs <PROGRAM_ID> --url mainnet-beta
