import * as React from "react"
import { useMemo } from 'react';
require('@solana/wallet-adapter-react-ui/styles.css');
import {
    ChakraProvider,
    Box,
    extendTheme,
} from "@chakra-ui/react"
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Routes, Route } from "react-router-dom";
import { Navbar } from './screens/Navbar'
import { NewForm } from "./screens/Form";
import { NFTPage } from "./screens/NFTPage";
import {Home} from './screens/Home'

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    components: {
        Button: {
            variants: {
                // 4. We can override existing variants
                solid: {
                    bg: '#FF5B37',
                    _hover: {
                        bg: '#FF5B37',
                    },
                },
                outline: {
                    borderColor: '#FF5B37',
                    color: '#FF5B37',
                    _hover: {
                        borderColor: '#FF5B37',
                    },
                },
            },
        },
    },
});

export const App = () => {

    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;
    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );
    return (
        <ChakraProvider theme={theme}>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <Box
                            fontSize="xl"
                            backgroundColor="#020D27"
                            width="full"
                            height="100%"
                            px={85}
                        >
                            <Navbar/>
                            <Routes>
                                <Route path="/" element={<Home />}/>
                            </Routes>
                        </Box>
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </ChakraProvider>
    );
}
