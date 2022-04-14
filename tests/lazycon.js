
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
    
    let v1 = await anchor.getProvider().connection.getBalance(proposalAccount.publicKey);
    await console.log(v1)
    
    const lamports = 5000000000;
    // await console.log(lamports);
    
    let transaction = new Transaction();

    // Add an instruction to execute
    transaction.add(SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: proposalAccount.publicKey,
        lamports: lamports,
    }));
    // await console.log(typeof provider.wallet);
    // await console.log(provider.wallet.payer._keypair.secretKey);
    await sendAndConfirmTransaction(anchor.getProvider().connection, transaction, [provider.wallet.payer])

    v1 = await anchor.getProvider().connection.getBalance(proposalAccount.publicKey);
    await console.log(v1)

  });

  it('Execute Proposal', async () => {
    // Add your test here.
    const program = await anchor.workspace.Lazycon;

    let v1 = await anchor.getProvider().connection.getBalance(new anchor.web3.PublicKey("6ZRCB7AAqGre6c72PRz3MHLC73VMYvJ8bi9KHf1HFpNk"));
    await console.log(v1)

    const tx = await program.rpc.execute(
      {
        accounts: {
          signer : provider.wallet.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        remainingAccounts: [ 
          {pubkey: provider.wallet.publicKey, isSigner: false, isWritable: true},
          {pubkey: provider.wallet.publicKey, isSigner: false, isWritable: true},
          {pubkey: provider.wallet.publicKey, isSigner: false, isWritable: true}
        ],
        signers: [
        ]
      }
    );
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account)

    v1 = await anchor.getProvider().connection.getBalance(new anchor.web3.PublicKey("6ZRCB7AAqGre6c72PRz3MHLC73VMYvJ8bi9KHf1HFpNk"));
    await console.log(v1)
  });
});
