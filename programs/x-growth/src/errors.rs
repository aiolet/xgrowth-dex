use anchor_lang::prelude::*;

#[error_code]
pub enum XGrowthError {
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    
    #[msg("Maximum supply reached")]
    MaxSupplyReached,
    
    #[msg("Insufficient reserve balance")]
    InsufficientReserve,
    
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    
    #[msg("Invalid bonding curve parameters")]
    InvalidBondingCurve,
}
