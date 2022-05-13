use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{CloseAccount, Mint, Token, TokenAccount, Transfer},
};
use std::vec::Vec;

declare_id!("12UTVpY9q9mgiSJ3uDL1f44Ry5kzmEWsbT8EnfqqShrP");
// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod lazycon {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, _mint_key: Pubkey) -> Result<()> {
        let _proposal_account = &mut ctx.accounts.proposal_account;
        _proposal_account.mint_key = _mint_key;

        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<Dataupdate>,
        _useraddress: Pubkey,
        _amounttransfer: u64,
    ) -> Result<()> {
        // Put the check if the signer has voting power or not

        let _proposal_account = &mut ctx.accounts.proposal_account;
        let now_ts = (Clock::get().unwrap().unix_timestamp as u64);  // Time Fiddle
        _proposal_account.user_addresses.push(_useraddress);
        _proposal_account.amount_transfer.push(_amounttransfer);
        _proposal_account.expiry_time.push(now_ts);
        _proposal_account.votes_proposal.push(0);
        _proposal_account.keys_voted.push(vec![]);



        Ok(())
    }

    pub fn votes_proposal(
        ctx: Context<Voteupdate>,
        _index: u64,
        _expiry_time: u64,
        _user_addresses: Pubkey,
        _amount_transfer: u64,
    ) -> Result<()> {
        // we will remove _votes param and fetch it from PDA

        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(
            _proposal_account.user_addresses[_index as usize]==_user_addresses &&
            // _proposal_account.expiry_time[_index as usize]==_expiry_time &&
            _proposal_account.amount_transfer[_index as usize]==_amount_transfer,
            CustomError::WrongInput
        );
        require!(
            !_proposal_account.keys_voted[_index as usize].contains(&ctx.accounts.signer.to_account_info().key()),
            CustomError::VotingAgain
        );

        _proposal_account.votes_proposal[_index as usize] += ctx.accounts.user_account.voting_power;

        _proposal_account.keys_voted[_index as usize]
            .push(ctx.accounts.signer.to_account_info().key());
        Ok(())
    }

    pub fn execute(ctx: Context<Execupdate>) -> Result<()> {
        // Put the check if the signer has voting power or not

        let _proposal_account = &mut ctx.accounts.proposal_account;
        let remacc = ctx.remaining_accounts.to_vec();
        let now_ts = Clock::get().unwrap().unix_timestamp as u64;

        let adrvector = &_proposal_account.user_addresses;
        let amtvector = &_proposal_account.amount_transfer;
        let evector = &_proposal_account.expiry_time;
        let votesvector = &_proposal_account.votes_proposal;
        let totalvote = &_proposal_account.total_votes;

        let length_v = adrvector.len();
        let mut endelem = 0;
        let elem = 0;
        for elem in 0..length_v {
            // if now_ts < evector[elem] {

                
            //     endelem = elem+1;
                
            //     // _proposal_account.tkr.push(evector[elem]);

                
        

            //     break;
            // }
            if (votesvector[elem] / totalvote) * 10 < 4 {
                
                **_proposal_account
                    .to_account_info()
                    .try_borrow_mut_lamports()? -= amtvector[elem];
                require!(
                    remacc[elem].key() == adrvector[elem],
                    CustomError::WrongInput
                );
                **remacc[elem].try_borrow_mut_lamports()? += amtvector[elem];
            
            }

            
            
        }

        // if elem == length_v-1 {

            _proposal_account.user_addresses.drain(0..length_v);
                _proposal_account.amount_transfer.drain(0..length_v);
                _proposal_account.expiry_time.drain(0..length_v);
                _proposal_account.votes_proposal.drain(0..length_v);
                _proposal_account.keys_voted.drain(0..length_v);

        // }else{
        //     _proposal_account.user_addresses.drain(0..endelem);
        //         _proposal_account.amount_transfer.drain(0..endelem);
        //         _proposal_account.expiry_time.drain(0..endelem);
        //         _proposal_account.votes_proposal.drain(0..endelem);
        //         _proposal_account.keys_voted.drain(0..endelem);
        // }
        



       

        Ok(())
    }

    pub fn init_user(ctx: Context<CreateUserAccount>, _name: String) -> Result<()> {
        let user_info = &mut ctx.accounts.user_account;
        if _name.as_bytes().len() > 200 {
            panic!();
        }
        user_info.name = _name;
        user_info.bump = *ctx.bumps.get("user_account").unwrap();
        
        Ok(())
    }

    pub fn lock_tokens(ctx: Context<LockTokens>, _lock_tokens: u64) -> Result<()> {
        
        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(ctx.accounts.mint_of_token_being_sent.to_account_info().key() == _proposal_account.mint_key,CustomError::WrongInput);

        let transfer_instruction = anchor_spl::token::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.user_vault.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );

        anchor_spl::token::transfer(cpi_ctx, _lock_tokens)?;
        let user_info = &mut ctx.accounts.user_account;
        user_info.voting_power = _lock_tokens;
        user_info.lock_time =  Clock::get().unwrap().unix_timestamp as u64;
        _proposal_account.total_votes = _proposal_account.total_votes + _lock_tokens;


        Ok(())
    }

    pub fn lock_tokens_again(ctx: Context<LockTokensAgain>, _vault_bump: u8, _locked_tokens: u64) -> Result<()> {
        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(ctx.accounts.mint_of_token_being_sent.to_account_info().key() == _proposal_account.mint_key,CustomError::WrongInput);
        let transfer_instruction = anchor_spl::token::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.user_vault.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        let user_info = &mut ctx.accounts.user_account;
    
        require!(
            user_info.lock_time == 0,
            CustomError::LockPeriodNotEnded
        );

        anchor_spl::token::transfer(cpi_ctx, _locked_tokens)?;
        user_info.voting_power = _locked_tokens;
        user_info.lock_time =  Clock::get().unwrap().unix_timestamp as u64;
        _proposal_account.total_votes = _proposal_account.total_votes + _locked_tokens;
        Ok(())
    }

    pub fn unlock_tokens(ctx: Context<UnlockTokens>, _vault_bump: u8) -> Result<()> {
        let user_info = &mut ctx.accounts.user_account;
        let now = Clock::get().unwrap().unix_timestamp as u64;
        require!(now >= user_info.lock_time , CustomError::LockPeriodNotEnded);  // Time Fiddle 864000s =  10 days min lock period
        let transfer_instruction = anchor_spl::token::Transfer {
            from: ctx.accounts.user_vault.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
            authority: ctx.accounts.user_vault.to_account_info(),
        };
        let bump_vector = _vault_bump.to_le_bytes();
        let inner = vec![b"user-vault".as_ref(), ctx.accounts.signer.key.as_ref(), bump_vector.as_ref()];
        let outer = vec![inner.as_slice()];
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            outer.as_slice(),
        );
        let _proposal_account = &mut ctx.accounts.proposal_account;
        anchor_spl::token::transfer(cpi_ctx, user_info.voting_power)?;
        _proposal_account.total_votes -= user_info.voting_power;
        user_info.voting_power = 0;
        user_info.lock_time = 0;
        Ok(())
    }
}

// An enum for custom error codes
#[error_code]
pub enum CustomError {
    WrongInput,
    TimeError,
    SameUser,
    WrongUser,
    ChallengeNotExpired,
    ChallengeExpired,
    NoFullConsent,
    NotEnoughFunds,
    VotingAgain,
    LockPeriodNotEnded
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 500)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Dataupdate<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Execupdate<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Voteupdate<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub signer: Signer<'info>,
    #[account(mut, seeds = [b"user-account".as_ref(), signer.key().as_ref()], bump = user_account.bump)]
    pub user_account: Account<'info, UserAccount>,
}

#[account]
pub struct ProposalAccount {
    pub expiry_time: Vec<u64>,
    pub user_addresses: Vec<Pubkey>,
    pub amount_transfer: Vec<u64>,
    pub votes_proposal: Vec<u64>,
    pub keys_voted: Vec<Vec<Pubkey>>,
    pub total_votes: u64,
    pub mint_key : Pubkey
}

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // space: 8 discriminator + 8 voting_power + 4 name length + 200 name + 1 bump
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 4 + 200 + 1 + 8, seeds = [b"user-account".as_ref(), user.key().as_ref()], bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct LockTokens<'info> {
    #[account(mut, seeds = [b"user-account".as_ref(), signer.key().as_ref()], bump = user_account.bump)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub mint_of_token_being_sent: Account<'info, Mint>,
    #[account(
        init,
        payer = signer,
        seeds = [b"user-vault".as_ref(),signer.key().as_ref()],
        bump,
        token::mint = mint_of_token_being_sent,
        token::authority = user_vault,
    )]
    pub user_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = user.mint ==  mint_of_token_being_sent.key())]
    pub user: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(vault_bump: u8)]
pub struct UnlockTokens<'info> {
    #[account(mut, seeds = [b"user-account".as_ref(), signer.key().as_ref()], bump = user_account.bump)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub mint_of_token_being_sent: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [b"user-vault".as_ref(),signer.key().as_ref()],
        bump=vault_bump,
    )]
    pub user_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = user.mint ==  mint_of_token_being_sent.key(), constraint = user.owner == signer.key())]
    pub user: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(vault_bump: u8)]
pub struct LockTokensAgain<'info> {
    #[account(mut, seeds = [b"user-account".as_ref(), signer.key().as_ref()], bump = user_account.bump)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    pub mint_of_token_being_sent: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [b"user-vault".as_ref(),signer.key().as_ref()],
        bump=vault_bump,
    )]
    pub user_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = user.mint ==  mint_of_token_being_sent.key(), constraint = user.owner == signer.key())]
    pub user: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(Default)]
pub struct UserAccount {
    voting_power: u64,
    name: String,
    bump: u8,
    lock_time: u64,
}
