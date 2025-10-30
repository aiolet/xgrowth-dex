use anchor_lang::prelude::*;

#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub daily_reward_pool: u64, // 200 USDT per day
    pub total_agents: u64,
    pub usdt_mint: Pubkey,
    pub oracle: Pubkey,
    pub bump: u8,
}

impl Platform {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 32 + 32 + 1;
}

#[account]
pub struct Agent {
    pub agent_id: String,
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    
    // Bonding curve parameters
    pub bonding_curve: BondingCurveParams,
    pub total_supply: u64,
    pub circulating_supply: u64,
    pub reserve_balance: u64, // USDT in reserve
    
    // Performance metrics
    pub performance: PerformanceMetrics,
    
    // Reward tracking
    pub total_rewards_earned: u64,
    pub last_reward_distribution: i64,
    
    pub bump: u8,
}

impl Agent {
    pub const LEN: usize = 8 + 
        (4 + 32) + // agent_id
        32 + // authority
        32 + // token_mint
        (4 + 64) + // name
        (4 + 16) + // symbol
        (4 + 200) + // uri
        BondingCurveParams::LEN +
        8 + 8 + 8 + // supplies and balance
        PerformanceMetrics::LEN +
        8 + 8 + // rewards
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct BondingCurveParams {
    pub base_price: u64,      // Base price in USDT (with decimals)
    pub curve_factor: u64,    // Multiplier for curve steepness
    pub max_supply: u64,      // Maximum tokens that can be sold
}

impl BondingCurveParams {
    pub const LEN: usize = 8 + 8 + 8;
    
    // Calculate price based on current supply
    // Price = base_price * (1 + supply / max_supply)^2
    pub fn calculate_price(&self, current_supply: u64) -> u64 {
        let supply_ratio = (current_supply as u128 * 1_000_000) / self.max_supply as u128;
        let price_multiplier = 1_000_000 + supply_ratio;
        let squared = (price_multiplier * price_multiplier) / 1_000_000;
        ((self.base_price as u128 * squared) / 1_000_000) as u64
    }
    
    // Calculate tokens received for USDT amount
    pub fn calculate_tokens_out(&self, usdt_amount: u64, current_supply: u64) -> u64 {
        // Simplified calculation - in production use integral calculus
        let avg_price = self.calculate_price(current_supply);
        (usdt_amount * 1_000_000) / avg_price
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct PerformanceMetrics {
    pub total_likes: u64,
    pub total_views: u64,
    pub total_comments: u64,
    pub total_followers: u64,
    pub last_updated: i64,
    
    // Daily metrics for reward calculation
    pub daily_likes: u64,
    pub daily_views: u64,
    pub daily_comments: u64,
    pub daily_new_followers: u64,
}

impl PerformanceMetrics {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8;
    
    // Calculate performance score
    // Score = (Likes × 1.0) + (Views × 0.1) + (Comments × 2.0) + (Followers × 5.0)
    pub fn calculate_score(&self) -> u64 {
        let likes_score = self.daily_likes;
        let views_score = self.daily_views / 10;
        let comments_score = self.daily_comments * 2;
        let followers_score = self.daily_new_followers * 5;
        
        likes_score + views_score + comments_score + followers_score
    }
    
    pub fn reset_daily_metrics(&mut self) {
        self.daily_likes = 0;
        self.daily_views = 0;
        self.daily_comments = 0;
        self.daily_new_followers = 0;
    }
}

#[account]
pub struct UserRewards {
    pub user: Pubkey,
    pub agent: Pubkey,
    pub pending_rewards: u64,
    pub claimed_rewards: u64,
    pub last_claim: i64,
    pub bump: u8,
}

impl UserRewards {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1;
}
