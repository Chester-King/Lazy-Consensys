import {
  Button,
  HStack,
  Text,
  Link as NativeLink,
  Image,
  Box,
} from '@chakra-ui/react';
import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

export const Navbar = () => {
  return (
    <HStack justify="space-between" py={55}>
      <HStack pr={300} spacing={3}>
        <Text fontWeight="semibold" color="white">
          LazyCon
        </Text>
      </HStack>
      <HStack justify="space-between" width="full">
        <Box>
          <Link to="/">
            <Text fontWeight="semibold" color="white">
              Home
            </Text>
          </Link>
        </Box>
        <Box>
          <Link to="/explore">
            <Text fontWeight="semibold" color="white">
              Explore
            </Text>
          </Link>
        </Box>
        <Box>
          <Link to="/new">
            <Text fontWeight="semibold" color="white">
              Create
            </Text>
          </Link>
        </Box>
        <Button
          variant="solid"
          borderRadius="full"
          backgroundColor="white"
          rightIcon={<FaGithub color="black" />}
          as={NativeLink}
          href="https://github.com/"
        >
          <Text fontWeight="semibold" color="black">
            GitHub
          </Text>
        </Button>
        <WalletMultiButton />
      </HStack>
    </HStack>
  );
};
