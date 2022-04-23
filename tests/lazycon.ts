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
  let mint;
  let sender_token;
  let receiver;
  let receiver_token;

  it('setup mints and token accounts', async () => {
    mint = anchor.web3.Keypair.generate();

    let create_mint_tx = new Transaction().add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: spl.MintLayout.span,
        lamports: await spl.getMinimumBalanceForRentExemptMint(program.provider.connection),
        programId: spl.TOKEN_PROGRAM_ID,
      }),
      // init mint account
      spl.createInitializeMintInstruction(mint.publicKey,6,provider.wallet.publicKey,provider.wallet.publicKey,spl.TOKEN_PROGRAM_ID)
    );

    await program.provider.send(create_mint_tx, [mint]);
    // Add your test here.
    // const tx = await program.rpc.initialize({});
    // console.log("Your transaction signature", tx);
    // console.log(await program.provider.connection.getParsedAccountInfo(mint));
    sender_token = anchor.web3.Keypair.generate();
    let create_sender_token_tx = new Transaction().add(
      // create token account
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: sender_token.publicKey,
        space: spl.AccountLayout.span,
        lamports: await spl.getMinimumBalanceForRentExemptAccount(program.provider.connection),
        programId: spl.TOKEN_PROGRAM_ID,
      }),
      // init mint account
      spl.createInitializeAccountInstruction(
        sender_token.publicKey,
        mint.publicKey, // mint
        provider.wallet.publicKey,
        spl.TOKEN_PROGRAM_ID, // owner of token account
      )
    );

    await program.provider.send(create_sender_token_tx, [sender_token]);

    receiver = anchor.web3.Keypair.generate();
    receiver_token = anchor.web3.Keypair.generate();
    let create_receiver_token_tx = new Transaction().add(
      // create token account
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: receiver_token.publicKey,
        space: spl.AccountLayout.span,
        lamports: await spl.getMinimumBalanceForRentExemptAccount(program.provider.connection),
        programId: spl.TOKEN_PROGRAM_ID,
      }),
      // init mint account
      spl.createInitializeAccountInstruction(
        receiver.publicKey ,
        mint.publicKey, // mint
        receiver_token.publicKey,
        spl.TOKEN_PROGRAM_ID, // owner of token account
      )
    );

    await program.provider.send(create_receiver_token_tx, [receiver_token]);

    let mint_tokens_tx = new Transaction().add(
      spl.createMintToInstruction(// always TOKEN_PROGRAM_ID
        mint.publicKey, // mint
        sender_token.publicKey, // receiver (sholud be a token account)
        provider.wallet.publicKey, // mint authority
        2e6,
        [], // only multisig account will use. leave it empty now.
        spl.TOKEN_PROGRAM_ID,  // amount. if your decimals is 8, you mint 10^8 for 1 token.
      )
    );

    await program.provider.send(mint_tokens_tx);

    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(sender_token.publicKey));
  });
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
      provider.wallet.publicKey,
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

