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
  const [userLockVault, vault_bump] = await PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("user-vault"),
      provider.wallet.publicKey.toBuffer(),
      // spl.TOKEN_PROGRAM_ID.toBuffer(),
      // mint.publicKey.toBuffer(),
    ],
    program.programId
  );
  const proposalAccount = anchor.web3.Keypair.generate();
  let mint: anchor.web3.Keypair;
  let sender_token:anchor.web3.PublicKey;
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
      spl.createInitializeMintInstruction(mint.publicKey, 6, provider.wallet.publicKey, provider.wallet.publicKey, spl.TOKEN_PROGRAM_ID)
    );

    await program.provider.sendAndConfirm(create_mint_tx, [mint])
    // Add your test here.
    // const tx = await program.rpc.initialize({});
    // console.log("Your transaction signature", tx);
    // console.log(await program.provider.connection.getParsedAccountInfo(mint));
    sender_token = await spl.getAssociatedTokenAddress(mint.publicKey, provider.wallet.publicKey, false, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID)

    let create_sender_token_tx = new Transaction().add(
      // init mint account
      spl.createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey, sender_token, provider.wallet.publicKey, mint.publicKey, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    await program.provider.sendAndConfirm(create_sender_token_tx);

    // receiver = anchor.web3.Keypair.generate();
    // receiver_token = anchor.web3.Keypair.generate();
    // let create_receiver_token_tx = new Transaction().add(
    //   // create token account
    //   SystemProgram.createAccount({
    //     fromPubkey: provider.wallet.publicKey,
    //     newAccountPubkey: receiver_token.publicKey,
    //     space: spl.AccountLayout.span,
    //     lamports: await spl.getMinimumBalanceForRentExemptAccount(program.provider.connection),
    //     programId: spl.TOKEN_PROGRAM_ID,
    //   }),
    //   // init mint account
    //   spl.createInitializeAccountInstruction(
    //     receiver_token.publicKey,
    //     mint.publicKey, // mint
    //     provider.wallet.publicKey,
    //     spl.TOKEN_PROGRAM_ID, // owner of token account
    //   )
    // );

    // await program.provider.sendAndConfirm(create_receiver_token_tx, [receiver_token]);
  });

  it("Mints tokens", async () => {
    let mint_tokens_tx = new Transaction().add(
      spl.createMintToInstruction(// always TOKEN_PROGRAM_ID
        mint.publicKey, // mint
        sender_token, // receiver (sholud be a token account)
        provider.wallet.publicKey, // mint authority
        2e6,
        [], // only multisig account will use. leave it empty now.
        spl.TOKEN_PROGRAM_ID,  // amount. if your decimals is 8, you mint 10^8 for 1 token.
      )
    );

    await program.provider.sendAndConfirm(mint_tokens_tx);

    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(sender_token));

  });

  // it('transfter wrapper', async () => {
  //   let amount = new anchor.BN(1e6);
  //   await program.rpc.transferWrapper(amount, {
  //     accounts: {
  //       sender: program.provider.wallet.publicKey,
  //       senderToken: sender_token,
  //       receiverToken: receiver_token.publicKey,
  //       mint: mint.publicKey,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     }
  //   })
  //   console.log("sender token balance: ", await program.provider.connection.getTokenAccountBalance(sender_token));
  //   console.log("receiver token balance: ", await program.provider.connection.getTokenAccountBalance(receiver_token.publicKey));

  // })

  it("Initialize Voter", async () => {
    await program.methods.initUser("Test").accounts({
      user: provider.wallet.publicKey,
      userAccount: userPDA,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    let user = await program.account.userAccount.fetch(userPDA)
    console.log("PDA - Account Address",userPDA.toBase58())
    console.log("PDA - Account",user)
  });

  it("Is initialized!", async () => {
    // Add your test here.
    await program.methods.initialize(mint.publicKey).accounts({
      user: provider.wallet.publicKey,
      proposalAccount: proposalAccount.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([proposalAccount]).rpc()
    // await console.log("Your transaction signature", tx);
    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account);
  });

  it("Locks Tokens", async () => {
    await program.methods.lockTokens(new anchor.BN(50)).accounts({
      mintOfTokenBeingSent: mint.publicKey,
      userAccount: userPDA,
      user: sender_token,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      userVault: userLockVault,
      proposalAccount: proposalAccount.publicKey
    }).rpc()
    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(sender_token));
    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(userLockVault));
    // console.log("init:",await program.provider.connection.getAccountInfo(userLockVault))
    // var [userLockVault2, vault_bump] = await PublicKey.findProgramAddress(
    //   [
    //     anchor.utils.bytes.utf8.encode("user-vault2"),
    //     provider.wallet.publicKey.toBuffer(),
    //   ],
    //   program.programId
    // );
    // console.log("ninit:",await program.provider.connection.getAccountInfo(userLockVault2))
    // console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(userPDA));
    let user = await program.account.userAccount.fetch(userPDA)
    console.log(user)
  })

  
  

  it("Create Proposal", async () => {
    // Add your test here
    await program.methods.createProposal(provider.wallet.publicKey,
      new anchor.BN(200)).accounts({
        signer: provider.wallet.publicKey,
        proposalAccount: proposalAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc()
    // const tx = await program.rpc.createProposal(
    //   provider.wallet.publicKey,
    //   new anchor.BN(200),
    //   {
    //     accounts: {
    //       signer: provider.wallet.publicKey,
    //       proposalAccount: proposalAccount.publicKey,
    //       systemProgram: anchor.web3.SystemProgram.programId,
    //     },
    //     signers: [],
    //   }
    // );
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
    let v1 = await anchor
      .getProvider()
      .connection.getBalance(proposalAccount.publicKey);
    await console.log(v1);
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

    await console.log("AFTER EXECUTION ------- ")
    await console.log(account);

    v1 = await anchor
      .getProvider()
      .connection.getBalance(proposalAccount.publicKey);
    await console.log(v1);
  });
  it("UnLocks Tokens", async () => {
    await program.methods.unlockTokens(vault_bump).accounts({
      mintOfTokenBeingSent: mint.publicKey,
      userAccount: userPDA,
      user: sender_token,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      userVault: userLockVault,
      proposalAccount: proposalAccount.publicKey
    }).rpc()
    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(sender_token));
    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(userLockVault));
    // console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(userPDA));
    let user = await program.account.userAccount.fetch(userPDA)
    console.log(user)


    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account);

    


  })


  it("Locks Tokens Again", async () => {
    await program.methods.lockTokensAgain(vault_bump, new anchor.BN(150000)).accounts({
      mintOfTokenBeingSent: mint.publicKey,
      userAccount: userPDA,
      user: sender_token,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      userVault: userLockVault,
      proposalAccount: proposalAccount.publicKey
    }).rpc()
    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(sender_token));
    console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(userLockVault));
    // console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(userPDA));
    let user = await program.account.userAccount.fetch(userPDA)
    console.log(user)

    let account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    await console.log(account);


  })

  
});

