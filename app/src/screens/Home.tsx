import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Link } from 'react-router-dom';
import { Lazycon } from '../../../target/types/lazycon';
import * as spl from '@solana/spl-token';
import { idl } from '../../idl';
import { Program, AnchorProvider, web3, Wallet, Idl, BN } from '@project-serum/anchor';
import { config } from '../consts';
const PROGRAM_ID = new PublicKey(config.PROGRAM_ID);
const { SystemProgram, Keypair } = web3;

export const Home = () => {
  const [modalType, setModalType] = useState('Name');
  const [modalValue, setModalValue] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const [anchorProgram, setAnchorProgram] = useState<any>(null);
  const [provider, setProvider] = useState<any>();
  const [userPDA, setUserPDA] = useState<PublicKey>();
  const [user, setUser] = useState<any>(null);
  const { connection } = useConnection();
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

  const handleChange = (e: React.FormEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement;
    setModalValue(target.value);
  };

  const loadPDA = async () => {
    const [PDA, _] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode('user-account'), (publicKey as PublicKey).toBuffer()],
      PROGRAM_ID
    );
    setUserPDA(PDA);
  };

  const getUserInfo = async () => {
    try {
      let user = await anchorProgram.account.userAccount.fetch(userPDA);
      console.log(user);
      setUser(user);
    } catch {
      console.log('Not signedup');
      setModalType('Name');
    }
  };

  const handleTokenModal = () => {
    setModalType('Number Of Tokens');
    onOpen();
  };
  const handleModalSubmit = async () => {
    try {
      if(modalType=="Name"){
        await anchorProgram.methods
        .initUser(modalValue)
        .accounts({
          user: publicKey,
          userAccount: userPDA,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      }else{
        
      }
    } catch (e) {
      console.log(e);
    }
    onClose();
  };

  useEffect(() => {
    console.log(connection.rpcEndpoint);
    getProvider();
  }, [wallet, publicKey]);

  useEffect(() => {
    loadPDA();
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

  useEffect(() => {
    getUserInfo();
  }, [userPDA, isOpen]);

  return (
    <Box p={10}>
      <HStack width="full" paddingBottom="40vh">
        <VStack width="full" alignItems="start" justify="flex-start" spacing={0}>
          <Heading fontSize={50} fontWeight="extrabold" pb={50}>
            Your Account
          </Heading>
          <VStack paddingBottom="5vh">
            {user ? (
              <Text fontSize="2xl">
                Name - {user.name}
                <br />
                Locked Tokens - {user.votingPower.toNumber()}
                <br />
                Locked Time - {user.lockTime.toNumber()}
              </Text>
            ) : (
              <Text fontSize="lg">
                Ummm... You seem to be new here
                <br />
                Initialize your account below
              </Text>
            )}
          </VStack>
          <HStack>
            {user ? (
              user.votingPower.toNumber != 0 ? (
                <Button size="lg" variant="solid" onClick={handleTokenModal}>
                  Lock Tokens
                </Button>
              ) : (
                <Button size="lg" variant="solid">
                  Unlock Tokens
                </Button>
              )
            ) : (
              <Button size="lg" variant="solid" onClick={onOpen}>
                Initialize
              </Button>
            )}
          </HStack>
        </VStack>
      </HStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter {modalType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input variant="outline" placeholder={modalType} onChange={handleChange} />
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button variant="solid" onClick={handleModalSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
