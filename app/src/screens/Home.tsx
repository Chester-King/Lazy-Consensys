import React, { useEffect, useState } from 'react';
import { Button, Heading, HStack, Image, VStack, Box } from '@chakra-ui/react';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from '@solana/web3.js';
import { Link } from 'react-router-dom';
import { Lazycon } from '../../../target/types/lazycon';
import { idl } from '../../idl'
import {
  Program, AnchorProvider, web3, Wallet, Idl
} from '@project-serum/anchor';
import 'dotenv/config'
const PROGRAM_ID = new PublicKey(idl.metadata.address)
const { SystemProgram, Keypair } = web3;


export const Home = () => {
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();
  const [anchorProgram, setAnchorProgram] = useState<any>(null);
  const [provider, setProvider] = useState<any>();
  const { connection } = useConnection();
  const signerWallet = {
    publicKey: publicKey,
    signTransaction: signTransaction,
    signAllTransactions: signAllTransactions,
  };
  const getProvider = () => {
    console.log("Getting provider");
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }

    const signerWallet = {
      publicKey: publicKey,
      signTransaction: signTransaction,
      signAllTransactions: signAllTransactions,
    };

    const provider = new anchor.AnchorProvider(connection, signerWallet, {
      commitment: "processed",
    });

    console.log("provider",provider);

    setProvider(provider);
  };

  const loadAnchor = async () => {
    const programId = new PublicKey(idl.metadata.address);

    if (provider) {
      const myProgram = new anchor.Program(idl, programId, provider);

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

  useEffect(() => {
    console.log(anchorProgram);
  }, [anchorProgram]);

  useEffect(() => {
    console.log(provider);
  }, [provider]);

  return (
    <Box p={10}>

      <HStack width="full">
        <VStack
          width="full"
          alignItems="start"
          justify="space-between"
          spacing={0}
        >
          <Heading fontSize={50} fontWeight="extrabold" pb={50}>
            Your Account
          </Heading>
          <HStack>
            <Button size="lg" variant="outline" as={Link} to="/explore">
              Explore
            </Button>
            <Button size="lg" variant="solid" as={Link} to="/new">
              Create
            </Button>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
