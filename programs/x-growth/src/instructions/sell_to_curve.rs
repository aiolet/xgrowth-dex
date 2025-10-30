use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct SellToCurve<'info> {
    #[account(
        mut,
        seeds = [b"agent", agent.agent_id.as_bytes()],
        bump = agent.bump
    )]
    pub agent: Account<'info, Agent>,
    
    #[account(
        mut,
        address = agent.token_mint
    )]
    pub token_mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = seller
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = seller_usdt_account.mint == platform.usdt_mint
    )]
    pub seller_usdt_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"reserve", agent.key().as_ref()],
        bump
    )]
    pub reserve_usdt_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

pub fn sell_to_curve(
    ctx: Context<SellToCurve>,
    token_amount: u64,
    min_usdt_out: u64,
) -> Result<()> {
    let agent = &mut ctx.accounts.agent;
    
    // Calculate USDT to return (simplified - should use integral)
    let current_price = agent.bonding_curve.calculate_price(agent.circulating_supply);
    let usdt_out = (token_amount * current_price) / 1_000_000;
    
    // Apply 1% sell fee
    let usdt_after_fee = (usdt_out * 99) / 100;
    
    // Check slippage
    require!(usdt_after_fee >= min_usdt_out, XGrowthError::SlippageExceeded);
    
    // Check reserve has enough
    require!(agent.reserve_balance >= usdt_after_fee, XGrowthError::InsufficientReserve);
    
    // Burn tokens
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        },
    );
    token::burn(burn_ctx, token_amount)?;
    
    // Transfer USDT to seller
    let agent_id = agent.agent_id.clone();
    let seeds = &[
        b"agent",
        agent_id.as_bytes(),
        &[agent.bump],
    ];
    let signer = &[&seeds[..]];
    
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.reserve_usdt_account.to_account_info(),
            to: ctx.accounts.seller_usdt_account.to_account_info(),
            authority: agent.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_ctx, usdt_after_fee)?;
    
    // Update state
    agent.circulating_supply -= token_amount;
    agent.reserve_balance -= usdt_after_fee;
    
    msg!("Sold {} tokens for {} USDT", token_amount, usdt_after_fee);
    
    Ok(())
}
