use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        seeds = [b"agent", agent.agent_id.as_bytes()],
        bump = agent.bump
    )]
    pub agent: Account<'info, Agent>,
    
    #[account(
        mut,
        seeds = [b"user_rewards", user.key().as_ref(), agent.key().as_ref()],
        bump = user_rewards.bump
    )]
    pub user_rewards: Account<'info, UserRewards>,
    
    #[account(
        mut,
        constraint = user_usdt_account.mint == platform.usdt_mint
    )]
    pub user_usdt_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"reward_pool"],
        bump
    )]
    pub reward_pool: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let user_rewards = &mut ctx.accounts.user_rewards;
    let clock = Clock::get()?;
    
    let amount = user_rewards.pending_rewards;
    require!(amount > 0, crate::errors::XGrowthError::NoRewardsToClaim);
    
    // Transfer USDT rewards
    let seeds = &[b"platform", &[ctx.accounts.platform.bump]];
    let signer = &[&seeds[..]];
    
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.reward_pool.to_account_info(),
            to: ctx.accounts.user_usdt_account.to_account_info(),
            authority: ctx.accounts.platform.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_ctx, amount)?;
    
    // Update user rewards state
    user_rewards.claimed_rewards += amount;
    user_rewards.pending_rewards = 0;
    user_rewards.last_claim = clock.unix_timestamp;
    
    msg!("Claimed {} USDT in rewards", amount);
    
    Ok(())
}
