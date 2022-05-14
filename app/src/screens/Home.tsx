import React, { useEffect, useState } from 'react';
import ikbal from './ikbal.png';
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
const { SystemProgram, Keypair } = web3;

export const Home = () => {
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<{ uservault: PublicKey | null; vault_bump: number | null; vault_info: any }>(
    { uservault: null, vault_bump: null, vault_info: null }
  );
  const [change,setChange] = useState(false);
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
      setUser(user);
    } catch {
      setModalType('Name');
    }
  };

  const getuserVault = async () => {
    var [userLockVault, vault_bump] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode('user-vault'), (publicKey as PublicKey).toBuffer()],
      PROGRAM_ID
    );
    let uservaultinfo = await connection.getAccountInfo(userLockVault);
    setUserInfo({ uservault: userLockVault, vault_bump: vault_bump, vault_info: uservaultinfo });
  };

  const handleTokenModal = () => {
    setModalType('Number Of Tokens');
    onOpen();
  };
  const unlockTokens = async() =>{
    var sender_token =  await spl.getAssociatedTokenAddress(MINT_ACCOUNT, publicKey as PublicKey, false, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID)
    await anchorProgram.methods.unlockTokens(userInfo.vault_bump).accounts({
      mintOfTokenBeingSent: MINT_ACCOUNT,
      userAccount: userPDA,
      user: sender_token,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      userVault: userInfo.uservault,
      proposalAccount: PROPOSAL_ACCOUNT
    }).rpc()
    setChange(!change);
  }
  const handleModalSubmit = async () => {
    try {
      if (modalType == 'Name') {
        await anchorProgram.methods
          .initUser(modalValue)
          .accounts({
            user: publicKey,
            userAccount: userPDA,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
      } else if(modalType == 'Number Of Tokens'){
        let sender_token =  await spl.getAssociatedTokenAddress(MINT_ACCOUNT, publicKey as PublicKey, false, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID)
        if(!userInfo.vault_info){
          await anchorProgram.methods.lockTokens(new anchor.BN((parseInt(modalValue) as number)*LAMPORTS_PER_SOL)).accounts({
            mintOfTokenBeingSent: MINT_ACCOUNT,
            userAccount: userPDA,
            user: sender_token,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            userVault: userInfo.uservault,
            proposalAccount: PROPOSAL_ACCOUNT
          }).rpc()
        } else{
          await anchorProgram.methods.lockTokensAgain(userInfo.vault_bump,new anchor.BN((parseInt(modalValue) as number)*LAMPORTS_PER_SOL)).accounts({
            mintOfTokenBeingSent: MINT_ACCOUNT,
            userAccount: userPDA,
            user: sender_token,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            userVault: userInfo.uservault,
            proposalAccount: PROPOSAL_ACCOUNT
          }).rpc()
        }
      }
    } catch (e) {
      console.log(e);
    }
    onClose();
  };

  useEffect(() => {
    getProvider();
  }, [wallet, publicKey]);

  useEffect(() => {
    loadPDA();
  }, [wallet, publicKey]);

  useEffect(() => {
    loadAnchor();
  }, [provider]);

  useEffect(() => {
    getuserVault();
  }, [publicKey]);

  useEffect(() => {
    getUserInfo();
  }, [userPDA, isOpen, publicKey, change]);

  return (
    <Box p={10}>
      <HStack width="full">
        <VStack width="full" alignItems="start" justify="flex-start" spacing={0}>
          <Heading fontSize={50} fontWeight="extrabold" pb={50}>
            Your Account
          </Heading>
          <VStack paddingBottom="5vh">
            {user ? (
              <Text fontSize="2xl">
                Name - {user.name}
                <br />
                Locked Tokens - {user.votingPower.toNumber()/LAMPORTS_PER_SOL}
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
              user.votingPower.toNumber() == 0 ? (
                <Button size="lg" variant="solid" onClick={handleTokenModal}>
                  Lock Tokens
                </Button>
              ) : (
                <Button size="lg" variant="solid" onClick={unlockTokens}>
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
        <Image src={ikbal} />
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
