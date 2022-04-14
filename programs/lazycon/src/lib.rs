use anchor_lang::prelude::*;
use anchor_lang::require;
use std::vec::Vec;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod lazycon {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {

        let _proposal_account = &mut ctx.accounts.proposal_account;

        Ok(())
    }

    pub fn create_proposal(ctx: Context<Dataupdate>, _useraddress : Pubkey, _amounttransfer: u64) -> ProgramResult{
        
        // Put the check if the signer has voting power or not

        let _proposal_account = &mut ctx.accounts.proposal_account;
        let now_ts = (Clock::get().unwrap().unix_timestamp as u64)+86400;
        _proposal_account.user_addresses.push(_useraddress);
        _proposal_account.amount_transfer.push(_amounttransfer);
        _proposal_account.expiry_time.push(now_ts);
        _proposal_account.votes_proposal.push(0);


        Ok(())
    }
}

// An enum for custom error codes
#[error]
pub enum CustomError {
    WrongInput,
    TimeError,
    SameUser,
    WrongUser,
    ChallengeNotExpired,
    ChallengeExpired,
    NoFullConsent,
    NotEnoughFunds
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 500)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct Dataupdate<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[account]
pub struct ProposalAccount {
    pub expiry_time : Vec<u64>,
    pub user_addresses: Vec<Pubkey>,
    pub amount_transfer : Vec<u64>,
    pub votes_proposal : Vec<u64>,
    pub total_votes : u64
}
