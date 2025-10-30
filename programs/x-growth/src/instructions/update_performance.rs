use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct UpdatePerformance<'info> {
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
    
    #[account(
        constraint = oracle.key() == platform.oracle @ XGrowthError::UnauthorizedOracle
    )]
    pub oracle: Signer<'info>,
}

pub fn update_performance(
    ctx: Context<UpdatePerformance>,
    likes: u64,
    views: u64,
    comments: u64,
    new_followers: u64,
) -> Result<()> {
    let agent = &mut ctx.accounts.agent;
    let clock = Clock::get()?;
    
    // Update cumulative metrics
    agent.performance.total_likes += likes;
    agent.performance.total_views += views;
    agent.performance.total_comments += comments;
    agent.performance.total_followers += new_followers;
    
    // Update daily metrics
    agent.performance.daily_likes += likes;
    agent.performance.daily_views += views;
    agent.performance.daily_comments += comments;
    agent.performance.daily_new_followers += new_followers;
    
    agent.performance.last_updated = clock.unix_timestamp;
    
    msg!(
        "Performance updated - Likes: {}, Views: {}, Comments: {}, Followers: {}",
        likes, views, comments, new_followers
    );
    
    Ok(())
}
