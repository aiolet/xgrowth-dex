use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token};
use crate::state::*;

#[derive(Accounts)]
#[instruction(agent_id: String)]
pub struct CreateAgent<'info> {
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(
        init,
        payer = authority,
        space = Agent::LEN,
        seeds = [b"agent", agent_id.as_bytes()],
        bump
    )]
    pub agent: Account<'info, Agent>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = agent,
        seeds = [b"token_mint", agent_id.as_bytes()],
        bump
    )]
    pub token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_agent(
    ctx: Context<CreateAgent>,
    agent_id: String,
    name: String,
    symbol: String,
    uri: String,
    initial_supply: u64,
    bonding_curve_params: BondingCurveParams,
) -> Result<()> {
    let agent = &mut ctx.accounts.agent;
    let platform = &mut ctx.accounts.platform;
    
    agent.agent_id = agent_id;
    agent.authority = ctx.accounts.authority.key();
    agent.token_mint = ctx.accounts.token_mint.key();
    agent.name = name;
    agent.symbol = symbol;
    agent.uri = uri;
    agent.bonding_curve = bonding_curve_params;
    agent.total_supply = initial_supply;
    agent.circulating_supply = 0;
    agent.reserve_balance = 0;
    agent.performance = PerformanceMetrics::default();
    agent.total_rewards_earned = 0;
    agent.last_reward_distribution = Clock::get()?.unix_timestamp;
    agent.bump = ctx.bumps.agent;
    
    platform.total_agents += 1;
    
    msg!("Agent created: {} ({})", agent.name, agent.symbol);
    
    Ok(())
}
