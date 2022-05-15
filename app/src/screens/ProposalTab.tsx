import React, { useEffect, useState } from 'react';
import marni from './marni.png';
import { Button, Tr, Td } from '@chakra-ui/react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Link } from 'react-router-dom';
import { Lazycon } from '../../../target/types/lazycon';
import * as spl from '@solana/spl-token';
import { idl } from '../../idl';
import { Program, AnchorProvider, web3, Wallet, Idl, BN } from '@project-serum/anchor';
import { config } from '../consts';
const PROGRAM_ID = new PublicKey(config.PROGRAM_ID);
const MINT_ACCOUNT = new PublicKey(config.MINT_ACCOUNT);
const PROPOSAL_ACCOUNT = new PublicKey(config.PROPOSAL_ACCOUNT);
type AppProps = {
  index: number;
  userAddress: string;
  amountTransfer: string;
  expiryTime: number;
  votes: string;
};

export const ProposalTab = (prop: AppProps) => {
  const [userPDA, setUserPDA] = useState<PublicKey>();
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const [anchorProgram, setAnchorProgram] = useState<any>(null);
  const [provider, setProvider] = useState<any>();
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [test, setTest] = useState<JSX.Element[]>();
  const [reciever, setReciever] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const signerWallet = {
    publicKey: publicKey,
    signTransaction: signTransaction,
    signAllTransactions: signAllTransactions,
  };
  const getProvider = () => {
    console.log('Getting provider');
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }

    const signerWallet = {
      publicKey: publicKey,
      signTransaction: signTransaction,
      signAllTransactions: signAllTransactions,
    };

    const provider = new anchor.AnchorProvider(connection, signerWallet, {
      commitment: 'processed',
    });

    console.log('provider', provider);

    setProvider(provider);
  };

  const loadAnchor = async () => {
    if (provider) {
      const myProgram = new anchor.Program(idl, PROGRAM_ID, provider);
      console.log(myProgram);
      setAnchorProgram(myProgram);
    }
  };

  const loadPDA = async () => {
    const [PDA, _] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode('user-account'), (publicKey as PublicKey).toBuffer()],
      PROGRAM_ID
    );
    setUserPDA(PDA);
  };

  useEffect(() => {
    getProvider();
  }, [wallet, publicKey]);

  useEffect(() => {
    loadAnchor();
  }, [provider]);

  useEffect(() => {
    loadPDA();
  }, [wallet, publicKey]);

  const voteProposal = async () => {
    console.log(prop.index, prop.expiryTime, prop.userAddress, prop.amountTransfer);
    setSubmitting(true);
    try {
      await anchorProgram.methods
        .votesProposal(
          new anchor.BN(prop.index),
          new anchor.BN(prop.expiryTime as number),
          new PublicKey(prop.userAddress),
          new anchor.BN(prop.amountTransfer)
        )
        .accounts({
          proposalAccount: PROPOSAL_ACCOUNT,
          userAccount: userPDA,
        })
        .rpc();
        setSubmitting(false);
        window.location.reload();
    } catch (e) {
      alert(e);
    } finally {
      setSubmitting(false);
    }
  };

  const execProposal = async () => {
    let reciever = new PublicKey(prop.userAddress);
    console.log(prop.userAddress);
    setSubmitting(true);
    anchorProgram.methods
      .execute()
      .remainingAccounts([
        {
          pubkey: reciever,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: reciever,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: reciever,
          isSigner: false,
          isWritable: true,
        },
      ])
      .accounts({
        signer: publicKey,
        proposalAccount: PROPOSAL_ACCOUNT,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    //onOpen();
    setSubmitting(false);
  };

  return (
    <>
      <Tr>
        <Td>{prop.userAddress}</Td>
        <Td>{prop.amountTransfer}</Td>
        <Td>{prop.expiryTime}</Td>
        <Td>{prop.votes}</Td>
        <Td>
          <Button bgColor="#FF5B37" onClick={voteProposal} isDisabled={!publicKey || submitting} isLoading={submitting}>
            Vote
          </Button>
        </Td>
      </Tr>
    </>
  );
};
