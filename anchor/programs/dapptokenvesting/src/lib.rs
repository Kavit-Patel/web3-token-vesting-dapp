#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod dapptokenvesting {
    use super::*;

  pub fn close(_ctx: Context<CloseDapptokenvesting>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.dapptokenvesting.count = ctx.accounts.dapptokenvesting.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.dapptokenvesting.count = ctx.accounts.dapptokenvesting.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeDapptokenvesting>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.dapptokenvesting.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeDapptokenvesting<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Dapptokenvesting::INIT_SPACE,
  payer = payer
  )]
  pub dapptokenvesting: Account<'info, Dapptokenvesting>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseDapptokenvesting<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub dapptokenvesting: Account<'info, Dapptokenvesting>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub dapptokenvesting: Account<'info, Dapptokenvesting>,
}

#[account]
#[derive(InitSpace)]
pub struct Dapptokenvesting {
  count: u8,
}
