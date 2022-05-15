import React, { useEffect, useState } from 'react';
import marni from './marni.png';
import {
  Button,
  Heading,
  HStack,
  Image,
  VStack,
  Box,
  Text,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Table,
  Thead,
  Tbody,
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
const PROGRAM_ID = new PublicKey(config.PROGRAM_ID);
const MINT_ACCOUNT = new PublicKey(config.MINT_ACCOUNT);
const PROPOSAL_ACCOUNT = new PublicKey(config.PROPOSAL_ACCOUNT);

export const Proposals = () => {
  const [userInfo, setUserInfo] = useState<{ uservault: PublicKey | null; vault_bump: number | null; vault_info: any }>(
    { uservault: null, vault_bump: null, vault_info: null }
  );
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const [anchorProgram, setAnchorProgram] = useState<any>(null);
  const [provider, setProvider] = useState<any>();
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [test, setTest] = useState();
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

  useEffect(() => {
    getProvider();
  }, [wallet, publicKey]);

  useEffect(() => {
    loadAnchor();
  }, [provider]);

  const getPropInfo = async () => {
    try {
      let propac = await anchorProgram.account.proposalAccount.fetch(PROPOSAL_ACCOUNT);
      console.log(propac);
      let tab = [];
      for(let i = 0; i < propac.userAddresses.length; i++) {
          let dat = new Date(propac.expiryTime[i].toNumber() * 1000);
          let exp = [dat.getDate(), dat.getMonth(), dat.getFullYear(), dat.getHours(), dat.getMinutes(), dat.getSeconds()]
          tab.push(<Tr><Td>{propac.userAddresses[i].toString()}</Td><Td>{propac.amountTransfer[i].toString()}</Td><Td>{exp[0]}/{exp[1]}/{exp[2]} {exp[3]}:{exp[4]}:{exp[5]}</Td><Td>{propac.keysVoted[i].length}</Td></Tr>)
      }
      
      setTest(tab)
    } catch(err) {
      console.log(err)
    }
    return "bald"
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
            <TableContainer>
  <Table variant='simple'>
    <Thead>
      <Tr>
        <Th>Proposal Address</Th>
        <Th>Amount</Th>
        <Th>Expiry Time</Th>
        <Th>Votes</Th>
      </Tr>
    </Thead>
    <Tbody>
        {test}
    </Tbody>
  </Table>
</TableContainer>
          </VStack>
          <Image src={marni} />
        </HStack>
      </VStack>
    </>
  );
};
