import { Adapter, WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter, SolflareWalletAdapter, SolletExtensionWalletAdapter, SolletWalletAdapter, TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react"
import { useRouter } from 'next/router';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { AuthProvider } from '../context/authContext';


// Use require instead of import since order matters
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const Noop = ({ children }: any) => <>{children}</>;


const App: FC<AppProps> = ({ Component, pageProps: { session, ...pageProps } }: any) => {
    const router = useRouter();
    const noContextRoutesDefaultValue = ['/oauth/verify_scopes', '/privacy'];
    const [noContextRoutes] = useState(noContextRoutesDefaultValue)

    const ContextProvider = Component.provider || Noop;

    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () =>
            typeof window === 'undefined'
                ? [] // No wallet adapters when server-side rendering.
                : [
                    /**
                     * Wallets that implement either of these standards will be available automatically.
                     *
                     *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
                     *     (https://github.com/solana-mobile/mobile-wallet-adapter)
                     *   - Solana Wallet Standard
                     *     (https://github.com/solana-labs/wallet-standard)
                     *
                     * If you wish to support a wallet that supports neither of those standards,
                     * instantiate its legacy wallet adapter here. Common legacy adapters can be found
                     * in the npm package `@solana/wallet-adapter-wallets`.
                     */
                    // new UnsafeBurnerWalletAdapter(),
                    new PhantomWalletAdapter(),
                    new SolflareWalletAdapter(),
                    new SolletWalletAdapter({ network }),
                    new SolletExtensionWalletAdapter({ network }),
                    new TorusWalletAdapter(),
                ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError, adapter?: Adapter) => {
            // enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error, adapter);
        },
        []
        // [enqueueSnackbar]
    );

   


    return (
        <>
            {noContextRoutes.includes(router.pathname) ? (
                <Component {...pageProps} />) :
                (<ContextProvider>
                    <SessionProvider session={session}>
                        <ConnectionProvider endpoint={endpoint}>
                            <WalletProvider wallets={wallets} onError={onError} autoConnect>
                                <AuthProvider>
                                    <WalletModalProvider>
                                        <Component {...pageProps} />
                                    </WalletModalProvider>
                                </AuthProvider>
                            </WalletProvider>
                        </ConnectionProvider>
                    </SessionProvider>
                </ContextProvider>
                )}
        </>

    );
};

export default App;
