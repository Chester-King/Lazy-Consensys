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

        // for test
        _proposal_account.total_votes = 4;

        Ok(())
    }


    pub fn execute(ctx: Context<Execupdate>) -> ProgramResult{
        
        // Put the check if the signer has voting power or not

        let _proposal_account = &mut ctx.accounts.proposal_account;
        let remacc = ctx.remaining_accounts.to_vec();
        
        
        let now_ts = (Clock::get().unwrap().unix_timestamp as u64);
        

        let mut adrvector = &_proposal_account.user_addresses;
        let mut amtvector = &_proposal_account.amount_transfer;
        let mut evector = &_proposal_account.expiry_time;
        let mut votesvector = &_proposal_account.votes_proposal;
        let mut totalvote = &_proposal_account.total_votes;


            


        let lengthV = adrvector.len();
        let mut endelem = 0;
        for elem in 0..lengthV {
            if(now_ts<evector[elem]){
                endelem = elem;
                break;
            }
            if((votesvector[elem]/totalvote) * 10<4){
                **_proposal_account.to_account_info().try_borrow_mut_lamports()? -= amtvector[elem];
                require!(remacc[elem].key()==adrvector[elem],CustomError::WrongInput);
                **remacc[elem].try_borrow_mut_lamports()? += amtvector[elem];
            }

        }

        _proposal_account.user_addresses.drain(0..endelem);
        _proposal_account.amount_transfer.drain(0..endelem);
        _proposal_account.expiry_time.drain(0..endelem);
        _proposal_account.votes_proposal.drain(0..endelem);

        


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

#[derive(Accounts)]
pub struct Execupdate<'info> {
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
