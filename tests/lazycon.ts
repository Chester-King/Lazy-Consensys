import assert from "assert";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as spl from "@solana/spl-token";
import { Lazycon } from "../target/types/lazycon";

const {
  Connection,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram,
} = anchor.web3;


describe("lazycon", async () => {
  const program = (await anchor.workspace.Lazycon) as Program<Lazycon>;
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const userAccount = anchor.web3.Keypair.generate();
  const [userPDA, _] = await PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("user-account"),
      provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  );
  const proposalAccount = anchor.web3.Keypair.generate();

  it("Initialize Voter", async () => {
    await program.methods.initUser(new anchor.BN(52),"Test").accounts({
      user:provider.wallet.publicKey,
      userAccount:userPDA,
      tokenProgram:spl.TOKEN_PROGRAM_ID,
      systemProgram:anchor.web3.SystemProgram.programId,
    }).rpc();
      let user = await program.account.userAccount.fetch(userPDA)
      console.log(user) 
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({
      accounts: {
        user: provider.wallet.publicKey,
        proposalAccount: proposalAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [proposalAccount],
    });
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account);
  });

  it("Create Proposal", async () => {
    // Add your test here
    const tx = await program.rpc.createProposal(
      provider.wallet.publicKey,
      new anchor.BN(200),
      {
        accounts: {
          signer: provider.wallet.publicKey,
          proposalAccount: proposalAccount.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [],
      }
    );
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account);

    let v1 = await anchor
      .getProvider()
      .connection.getBalance(proposalAccount.publicKey);
    await console.log(v1);

    const lamports = 5000000000;
    // await console.log(lamports);

    let transaction = new Transaction();

    // Add an instruction to execute
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: proposalAccount.publicKey,
        lamports: lamports,
      })
    );
    // await console.log(typeof provider.wallet);
    // await console.log(provider.wallet.payer._keypair.secretKey);
    await provider.sendAndConfirm(transaction);

    v1 = await anchor
      .getProvider()
      .connection.getBalance(proposalAccount.publicKey);
    await console.log(v1);
  });

  it("Vote Proposal", async () => {
    const tx = await program.rpc.votesProposal(
      new anchor.BN(0),
      new anchor.BN(0), // need to pass expiry time
      userAccount.publicKey,
      new anchor.BN(200),
      {
        accounts: {
          signer: provider.wallet.publicKey,
          proposalAccount: proposalAccount.publicKey,
          userAccount: userPDA,
        },
        signers: [],
      }
    );
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account);

    // await console.log(lamports);
  });

  it("Execute Proposal", async () => {
    const tx = await program.rpc.execute({
      accounts: {
        signer: provider.wallet.publicKey,
        proposalAccount: proposalAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      remainingAccounts: [
        {
          pubkey: provider.wallet.publicKey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: provider.wallet.publicKey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: provider.wallet.publicKey,
          isSigner: false,
          isWritable: true,
        },
      ],
      signers: [],
    });
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account);
  });
});

