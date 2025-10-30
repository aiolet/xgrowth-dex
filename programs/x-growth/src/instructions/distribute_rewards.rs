use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct DistributeRewards<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent.agent_id.as_bytes()],
        bump = agent.bump
    )]
    pub agent: Account<'info, Agent>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
}

pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
    let agent = &mut ctx.accounts.agent;
    let platform = &ctx.accounts.platform;
    let clock = Clock::get()?;
    
    // Calculate performance score
    let score = agent.performance.calculate_score();
    
    // This would be called for all agents to calculate total score
    // Then distribute proportionally from the 200 USDT daily pool
    // For now, we just track the score
    
    agent.last_reward_distribution = clock.unix_timestamp;
    
    // Reset daily metrics for next day
    agent.performance.reset_daily_metrics();
    
    msg!("Rewards distributed - Performance score: {}", score);
    
    Ok(())
}
