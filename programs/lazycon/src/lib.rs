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
        _proposal_account.keys_voted.push(vec![]);

        // for test
        _proposal_account.total_votes = 4;

        Ok(())
    }

    pub fn votes_proposal(ctx: Context<Voteupdate>, _index: u64, _expiry_time: u64, _user_addresses: Pubkey, _amount_transfer: u64, _votes: u64) -> ProgramResult{

        // we will remove _votes param and fetch it from PDA

        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(
            _proposal_account.user_addresses[_index as usize]==_user_addresses &&
            // _proposal_account.expiry_time[_index as usize]==_expiry_time &&
            _proposal_account.amount_transfer[_index as usize]==_amount_transfer
            ,CustomError::WrongInput);
        
        require!(
            !_proposal_account.keys_voted[_index as usize].contains(&_user_addresses),
            CustomError::VotingAgain
        );

        _proposal_account.votes_proposal[_index as usize] = _proposal_account.votes_proposal[_index as usize]+_votes;
        
        _proposal_account.keys_voted[_index as usize].push(ctx.accounts.signer.to_account_info().key());

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
        _proposal_account.keys_voted.drain(0..endelem);

        


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
    NotEnoughFunds,
    VotingAgain
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

#[derive(Accounts)]
pub struct Voteupdate<'info> {
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
    pub keys_voted : Vec<Vec<Pubkey>>,
    pub total_votes : u64
}
