import React, { useEffect, useState } from 'react';
import marni from './marni.png';
import {
  Button,
  Heading,
  HStack,
  Image,
  VStack,
  Table,
  Thead,
  Tbody,
  Text,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Link } from 'react-router-dom';
import { Lazycon } from '../../../target/types/lazycon';
import * as spl from '@solana/spl-token';
import { idl } from '../../idl';
import { Program, AnchorProvider, web3, Wallet, Idl, BN } from '@project-serum/anchor';
import { config } from '../consts';
import { ProposalTab } from './ProposalTab';
const PROGRAM_ID = new PublicKey(config.PROGRAM_ID);
const MINT_ACCOUNT = new PublicKey(config.MINT_ACCOUNT);
const PROPOSAL_ACCOUNT = new PublicKey(config.PROPOSAL_ACCOUNT);

export const Proposals = () => {
  const [proposalAccount, setProposalAccount] = useState<any>();
  const [userPDA, setUserPDA] = useState<PublicKey>();
  const [remmainingAccounts, setRemainingAccounts] = useState<
    Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }>
  >([]);
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const [anchorProgram, setAnchorProgram] = useState<any>(null);
  const [provider, setProvider] = useState<any>();
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [test, setTest] = useState<JSX.Element[]>();

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

  const getPropInfo = async () => {
    try {
      let propac = await anchorProgram.account.proposalAccount.fetch(PROPOSAL_ACCOUNT);
      console.log(propac);
      setProposalAccount(propac);
      let tab = [];
      let remacc: Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> = [];
      propac.userAddresses.forEach((element: PublicKey) => {
        remacc.push({
          pubkey: element,
          isSigner: false,
          isWritable: true,
        });
      });
      setRemainingAccounts(remacc);
      for (let i = 0; i < propac.userAddresses.length; i++) {
        let dat = new Date(propac.expiryTime[i].toNumber());
        let exp = [
          dat.getDate(),
          dat.getMonth(),
          dat.getFullYear(),
          dat.getHours(),
          dat.getMinutes(),
          dat.getSeconds(),
        ];
        tab.push(
          <ProposalTab
            index={i}
            userAddress={propac.userAddresses[i].toString()}
            amountTransfer={propac.amountTransfer[i].toString()}
            expiryTime={propac.expiryTime[i].toNumber()}
            votes={propac.keysVoted[i].length}
          ></ProposalTab>
        );
      }
      setTest(tab);
    } catch (err) {
      console.log(err);
    }
    return 'bald';
  };

  const execProposal = async () => {
    setSubmitting(true);
    try {
      await anchorProgram.methods
        .execute()
        .remainingAccounts(remmainingAccounts)
        .accounts({
          signer: publicKey,
          proposalAccount: PROPOSAL_ACCOUNT,
          systemProgram: anchor.web3.SystemProgram.programId,
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

  useEffect(() => {
    getPropInfo();
  }, [publicKey, anchorProgram]);

  return (
    <>
      <VStack alignItems="start" spacing={20}>
        <HStack width="full" height="full">
          <VStack width="full" height="full" spacing={10} alignItems="start" alignContent="start">
            <Heading color="white">Proposals</Heading>
            {proposalAccount ? (
              <Text>Total Tokens Locked - {proposalAccount.totalVotes.toNumber() / LAMPORTS_PER_SOL}</Text>
            ) : (
              <></>
            )}
            <Button
              bgColor="#FF5B37"
              onClick={execProposal}
              isDisabled={!publicKey || submitting}
              isLoading={submitting}
            >
              Execute
            </Button>
            <TableContainer marginBottom="100px">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Reciever Address</Th>
                    <Th>Amount</Th>
                    <Th>Expiry Time</Th>
                    <Th>Votes</Th>
                    <Th>Vote</Th>
                  </Tr>
                </Thead>
                <Tbody>{test}</Tbody>
              </Table>
            </TableContainer>
          </VStack>
          <Image src={marni} />
        </HStack>
      </VStack>
    </>
  );
};
