fn transfer_escrow_out<'info>(sender: AccountInfo<'info>, receiver: AccountInfo<'info>, mintTok: AccountInfo<'info>, pda: &mut Account<'info, TokenAccount>, application_idx: u64, state: AccountInfo<'info>, state_bump: u8, token_program: AccountInfo<'info>, destination_wallet: AccountInfo<'info>, amount: u64) -> ProgramResult {
    // signing on behalf of our PDA.
    let bump_vector = state_bump.to_le_bytes();
    let mintTok_pk = mintTok.key().clone();
    let application_idx_bytes = application_idx.to_le_bytes();
    let inner = vec![b"state".as_ref(), sender.key.as_ref(), receiver.key.as_ref(), mintTok_pk.as_ref(),  application_idx_bytes.as_ref(), bump_vector.as_ref(),];
    let outer = vec![inner.as_slice()];

    // Perform the actual transfer
    let transfer_instruction = Transfer{
        from: pda.to_account_info(),
        to: destination_wallet,
        authority: state.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_instruction,
        outer.as_slice(),
    );
    anchor_spl::token::transfer(cpi_ctx, amount)?;

    let should_close = {
        pda.reload()?;
        pda.amount == 0
    };

    // If token account has no more tokens, it should be wiped out since it has no other use case.
    if should_close {
        let ca = CloseAccount{
            account: pda.to_account_info(),
            destination: sender.to_account_info(),
            authority: state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            token_program.to_account_info(),
            ca,
            outer.as_slice(),
        );
        anchor_spl::token::close_account(cpi_ctx)?;
    }

    Ok(())
}

#[program]
pub mod safe_pay {

    use anchor_spl::token::Transfer;
    use super::*;

    pub fn initialize_new_grant(ctx: Context<InitializeNewGrant>, application_idx: u64, state_bump: u8, _wallet_bump: u8, amount: u64) -> ProgramResult {

        // Set the state
        let state = &mut ctx.accounts.application_state;
        state.idx = application_idx;
        state.sender = ctx.accounts.sender.key().clone();
        state.receiver = ctx.accounts.receiver.key().clone();
        state.mintTok = ctx.accounts.mintTok.key().clone();
        state.pda = ctx.accounts.pda_state.key().clone();
        state.amt = amount;

        msg!("Initialized new Transfer instance for {}", amount);

        let bump_vector = state_bump.to_le_bytes();
        let mintTok_pk = ctx.accounts.mintTok.key().clone();
        let application_idx_bytes = application_idx.to_le_bytes();
        let inner = vec![
            b"state".as_ref(),
            ctx.accounts.sender.key.as_ref(),
            ctx.accounts.receiver.key.as_ref(),
            mintTok_pk.as_ref(), 
            application_idx_bytes.as_ref(),
            bump_vector.as_ref(),
        ];
        let outer = vec![inner.as_slice()];

        // Below is the actual instruction that we are going to send to the Token program.
        let transfer_instruction = Transfer{
            from: ctx.accounts.wallet_to_withdraw_from.to_account_info(),
            to: ctx.accounts.pda_state.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            outer.as_slice(),
        );

        anchor_spl::token::transfer(cpi_ctx, state.amt)?;

        Ok(())
    }

    pub fn complete_grant(ctx: Context<CompleteGrant>, application_idx: u64, state_bump: u8, _wallet_bump: u8) -> ProgramResult {

        transfer_escrow_out(
            ctx.accounts.sender.to_account_info(),
            ctx.accounts.receiver.to_account_info(),
            ctx.accounts.mintTok.to_account_info(),
            &mut ctx.accounts.pda_state,
            application_idx,
            ctx.accounts.application_state.to_account_info(),
            state_bump,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.wallet_to_deposit_to.to_account_info(),
            ctx.accounts.application_state.amount_tokens
        )?;

        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct State {
    // Program State
    index : u64,
    sender : Pubkey,
    receiver : Pubkey,
    //Mint of Token
    mintTok : Pubkey,
    pda : Pubkey,
    amt : u64,
}

#[derive(Accounts)]
#[instruction(application_idx: u64, state_bump: u8, wallet_bump: u8)]
pub struct InitializeNewGrant<'info> {
    #[account(init, payer = sender, seeds = [b"state".as_ref(), sender.key().as_ref(), receiver.key().as_ref(), mintTok.key().as_ref(), application_idx.to_le_bytes().as_ref()], bump = state_bump,)]
    application_state: Account<'info, State>,
    #[account(init, payer = sender, seeds=[b"wallet".as_ref(), sender.key().as_ref(), receiver.key.as_ref(), mintTok.key().as_ref(), application_idx.to_le_bytes().as_ref()], bump = wallet_bump, token::mint=mintTok, token::authority=application_state,)]
    pda_state: Account<'info, TokenAccount>,

    #[account(mut)]
    sender: Signer<'info>,
    receiver: AccountInfo<'info>,
    mintTok: Account<'info, Mint>,

    #[account(mut, constraint=wallet_to_withdraw_from.owner == sender.key(), constraint=wallet_to_withdraw_from.mint == mintTok.key())]
    wallet_to_withdraw_from: Account<'info, TokenAccount>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

pub struct CompleteGrant<'info> {
    #[account(mut, seeds=[b"state".as_ref(), sender.key().as_ref(), receiver.key.as_ref(), mintTok.key().as_ref(), application_idx.to_le_bytes().as_ref()], bump = state_bump, has_one = sender, has_one = receiver, has_one = mintTok,)]
    application_state: Account<'info, State>,
    #[account(mut, seeds=[b"wallet".as_ref(), sender.key().as_ref(), receiver.key.as_ref(), mintTok.key().as_ref(), application_idx.to_le_bytes().as_ref()], bump = wallet_bump,)]
    pda_state: Account<'info, TokenAccount>,

    #[account(init_if_needed, payer = receiver, associated_token::mint = mintTok, associated_token::authority = receiver,)]
    wallet_to_deposit_to: Account<'info, TokenAccount>,   

    #[account(mut)]
    sender: AccountInfo<'info>,                    
    #[account(mut)]
    receiver: Signer<'info>,            
    mintTok: Account<'info, Mint>,     

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    rent: Sysvar<'info, Rent>,
}