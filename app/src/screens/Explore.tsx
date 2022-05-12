import React from 'react';
import { Heading, HStack, Image, VStack, Box, Button } from '@chakra-ui/react';
import ikbal from './ikbal.png';
import { Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FaFile } from 'react-icons/fa';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';

import * as borsh from 'borsh';
import { Loader } from './Loader';

export const Explore = () => {

  return (
    <Box p={10}>
      <HStack width="full" alignItems="start">
        <VStack
          width="full"
          alignItems="start"
          justify="space-between"
          spacing={5}
        >
          <Heading fontSize={50} fontWeight="bold" pb={50}>
            See what everyone is thinking!
          </Heading>
          {!nftDetails && <Loader />}
          {nftDetails &&
            nftDetails.map((v, i, a) => {
              return (
                <Button
                  width="full"
                  variant="ghost"
                  // p={2}
                  borderWidth={1}
                  borderRadius={5}
                  m={5}
                  key={v.publicKey}
                  onClick={() =>
                    (window.location.href = `/#/nft/${v.publicKey}`)
                  }
                  height={100}
                >
                  <VStack width="full" alignItems="start">
                    <HStack textAlign="center" alignItems="center">
                      <FaFile />
                      <Text fontSize={28}>{v.name}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold">Description: </Text>
                      <Text fontWeight="light">{v.description}</Text>
                    </HStack>
                  </VStack>
                </Button>
              );
            })}
        </VStack>
        <Image src={ikbal} />
      </HStack>
    </Box>
  );
};
