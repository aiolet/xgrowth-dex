use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("XGrowth11111111111111111111111111111111111");

pub mod state;
pub mod instructions;
pub mod errors;

use state::*;
use instructions::*;
use errors::*;

#[program]
pub mod x_growth {
    use super::*;

    // Initialize the platform
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        daily_reward_pool: u64, // 200 USDT in lamports
    ) -> Result<()> {
        instructions::initialize_platform(ctx, daily_reward_pool)
    }

    // Create a new agent and its token
    pub fn create_agent(
        ctx: Context<CreateAgent>,
        agent_id: String,
        name: String,
        symbol: String,
        uri: String,
        initial_supply: u64,
        bonding_curve_params: BondingCurveParams,
    ) -> Result<()> {
        instructions::create_agent(ctx, agent_id, name, symbol, uri, initial_supply, bonding_curve_params)
    }

    // Buy tokens from bonding curve (primary market)
    pub fn buy_from_curve(
        ctx: Context<BuyFromCurve>,
        usdt_amount: u64,
        min_tokens_out: u64,
    ) -> Result<()> {
        instructions::buy_from_curve(ctx, usdt_amount, min_tokens_out)
    }

    // Sell tokens back to bonding curve
    pub fn sell_to_curve(
        ctx: Context<SellToCurve>,
        token_amount: u64,
        min_usdt_out: u64,
    ) -> Result<()> {
        instructions::sell_to_curve(ctx, token_amount, min_usdt_out)
    }

    // Update agent performance metrics (oracle only)
    pub fn update_performance(
        ctx: Context<UpdatePerformance>,
        likes: u64,
        views: u64,
        comments: u64,
        new_followers: u64,
    ) -> Result<()> {
        instructions::update_performance(ctx, likes, views, comments, new_followers)
    }

    // Calculate and distribute daily rewards
    pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
        instructions::distribute_rewards(ctx)
    }

    // Claim rewards for token holders
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::claim_rewards(ctx)
    }
}
