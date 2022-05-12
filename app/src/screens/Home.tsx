import React from 'react';
import { Button, Heading, HStack, Image, VStack, Box } from '@chakra-ui/react';
import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Link } from 'react-router-dom';
import { Lazycon } from '../utils/lazycon';
import lazycon from '../utils/lazycon.json'
import {
  Program,
  Provider,
  BN,
  web3,
} from '@project-serum/anchor'
import 'dotenv/config'
const PROGRAM_ID = process.env.PROGRAM_ID

export const Home = () => {
  const wallet = useWallet();
  const connection = useConnection();
  const provider = 
  const program = new Program(lazycon,PROGRAM_ID,)
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
            Protect your Intellectual Property Rights using Blockchain. Create
            Patents as NFTs on Solana.
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
