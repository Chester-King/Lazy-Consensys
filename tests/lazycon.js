
const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { 
  Connection,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram

} = anchor.web3;
var BigNumber = require('big-number');


describe('lazycon', () => {

  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const proposalAccount = anchor.web3.Keypair.generate();

  it('Is initialized!', async () => {
    // Add your test here.
    const program = await anchor.workspace.Lazycon;
    const tx = await program.rpc.initialize(
      {
        accounts: {
          user : provider.wallet.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        signers: [
          proposalAccount
        ]
      }
    );
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account)
  });
  
  
  it('Create Proposal', async () => {
    // Add your test here.
    const program = await anchor.workspace.Lazycon;
    const tx = await program.rpc.createProposal(
      provider.wallet.publicKey,
      new anchor.BN(200),
      {
        accounts: {
          signer : provider.wallet.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        signers: [
        ]
      }
    );
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account)
  });
});
