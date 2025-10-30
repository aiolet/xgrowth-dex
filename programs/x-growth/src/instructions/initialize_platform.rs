use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = Platform::LEN,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: USDT mint address
    pub usdt_mint: AccountInfo<'info>,
    
    /// CHECK: Oracle pubkey for performance updates
    pub oracle: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize_platform(
    ctx: Context<InitializePlatform>,
    daily_reward_pool: u64,
) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    
    platform.authority = ctx.accounts.authority.key();
    platform.daily_reward_pool = daily_reward_pool;
    platform.total_agents = 0;
    platform.usdt_mint = ctx.accounts.usdt_mint.key();
    platform.oracle = ctx.accounts.oracle.key();
    platform.bump = ctx.bumps.platform;
    
    msg!("Platform initialized with daily reward pool: {}", daily_reward_pool);
    
    Ok(())
}
