use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct BuyFromCurve<'info> {
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
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = token_mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = buyer_usdt_account.mint == platform.usdt_mint
    )]
    pub buyer_usdt_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"reserve", agent.key().as_ref()],
        bump,
        constraint = reserve_usdt_account.mint == platform.usdt_mint
    )]
    pub reserve_usdt_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn buy_from_curve(
    ctx: Context<BuyFromCurve>,
    usdt_amount: u64,
    min_tokens_out: u64,
) -> Result<()> {
    let agent = &mut ctx.accounts.agent;
    
    // Calculate tokens to mint based on bonding curve
    let tokens_out = agent.bonding_curve.calculate_tokens_out(
        usdt_amount,
        agent.circulating_supply
    );
    
    // Check slippage protection
    require!(tokens_out >= min_tokens_out, XGrowthError::SlippageExceeded);
    
    // Check max supply
    require!(
        agent.circulating_supply + tokens_out <= agent.bonding_curve.max_supply,
        XGrowthError::MaxSupplyReached
    );
    
    // Transfer USDT from buyer to reserve
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.buyer_usdt_account.to_account_info(),
            to: ctx.accounts.reserve_usdt_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, usdt_amount)?;
    
    // Mint tokens to buyer
    let agent_id = agent.agent_id.clone();
    let seeds = &[
        b"agent",
        agent_id.as_bytes(),
        &[agent.bump],
    ];
    let signer = &[&seeds[..]];
    
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: agent.to_account_info(),
        },
        signer,
    );
    token::mint_to(mint_ctx, tokens_out)?;
    
    // Update agent state
    agent.circulating_supply += tokens_out;
    agent.reserve_balance += usdt_amount;
    
    msg!("Bought {} tokens for {} USDT", tokens_out, usdt_amount);
    
    Ok(())
}
