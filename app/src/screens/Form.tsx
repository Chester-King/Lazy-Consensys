import React, { useEffect, useState } from 'react';
import marni from './marni.png';
import hands from './hands.png';
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
import { FaExclamationCircle } from 'react-icons/fa';
const PROGRAM_ID = new PublicKey(config.PROGRAM_ID);
const MINT_ACCOUNT = new PublicKey(config.MINT_ACCOUNT);
const PROPOSAL_ACCOUNT = new PublicKey(config.PROPOSAL_ACCOUNT);
const { SystemProgram, Keypair } = web3;

export const NewForm = () => {
  const [userInfo, setUserInfo] = useState<{ uservault: PublicKey | null; vault_bump: number | null; vault_info: any }>(
    { uservault: null, vault_bump: null, vault_info: null }
  );
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const [anchorProgram, setAnchorProgram] = useState<any>(null);
  const [provider, setProvider] = useState<any>();
  const [userPDA, setUserPDA] = useState<PublicKey>();
  const [user, setUser] = useState<any>(null);
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [reciever, setReciever] = useState('');
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

  const createProposal = async () => {
    setSubmitting(true);
    await anchorProgram.methods
      .createProposal(new PublicKey(reciever), new anchor.BN(amount))
      .accounts({
        signer: publicKey,
        proposalAccount: PROPOSAL_ACCOUNT,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    onOpen();
    setSubmitting(false);
    setAmount('');
    setReciever('');
  };
  useEffect(() => {
    getProvider();
  }, [wallet, publicKey]);

  useEffect(() => {
    loadAnchor();
  }, [provider]);

  return (
    <>
      <VStack alignItems="start" spacing={20}>
        <HStack width="full" height="full">
          <VStack width="full" height="full" spacing={10} alignItems="start" alignContent="start">
            <Heading color="white">Create a new Proposal</Heading>
            <FormControl id="contents" isRequired paddingBottom={10}>
              <FormLabel color="white">Enter Public Key of Wallet</FormLabel>
              <Input
                placeholder="PublicKey"
                onChange={(e) => {
                  setReciever(e.target.value);
                }}
                marginBottom={10}
              />
              <FormLabel color="white">Enter Amount To Be Transfered</FormLabel>
              <Input
                placeholder="Amount(in Tokens)"
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />
            </FormControl>
            <HStack justify="space-between" width="full">
              <Button
                bgColor="#FF5B37"
                onClick={createProposal}
                isDisabled={!publicKey || !amount || !reciever || submitting}
                isLoading={submitting}
              >
                Create Proposal
              </Button>
              <HStack>
                {(!reciever || !amount) && (
                  <HStack p={2} borderColor="#FF5B37" borderWidth={1} borderRadius={10}>
                    <FaExclamationCircle color="#FF5B37" />
                    <Text fontSize="sm" color="#FF5B37">
                      Empty Fields
                    </Text>
                  </HStack>
                )}
                {!publicKey && (
                  <HStack p={2} borderColor="#FF5B37" borderWidth={1} borderRadius={10}>
                    <FaExclamationCircle color="#FF5B37" />
                    <Text fontSize="sm" color="#FF5B37">
                      Wallet not connected
                    </Text>
                  </HStack>
                )}
              </HStack>
            </HStack>
          </VStack>
          <Image src={marni} />
        </HStack>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bgColor="white">
          <ModalBody>
            <VStack py={10} alignItems="start">
              <Text color="black">Your Proposal was successfully created.</Text>
              <HStack width="70%" justify="space-between"></HStack>
            </VStack>
            <Image src={hands} position="absolute" right={0} bottom={0} p={2} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
