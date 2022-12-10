import { useWallet } from '@solana/wallet-adapter-react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React from 'react';
import { useSession, signOut } from "next-auth/react"
import styles from '../styles/Home.module.css';
import NFTImageList from '../components/NFTImageList';
import Branding from '../components/Branding';
import CommonFooter from '../components/CommonFooter';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const SignButtonDynamic = dynamic(
    async () => (await import('../components/SignMessage')).SignMessage,
    { ssr: false }
);

const Home: NextPage = () => {

    const { publicKey, } = useWallet();
    const { data: session } = useSession()

    return (
        <div className={styles.container}>
            <Head>
                <title>Web3 Music Vault</title>
                <meta name="description" content="Web3 Music Vault a way to connect Un-lockable NFT music with Alexa" />
                <Branding />
            </Head>
            <main className={styles.main}>
                <h1 className={styles.title}>
                    Web3 Music Vault
                </h1>
                <div className={styles.walletButtons}>
                    {session && publicKey && publicKey.toString() ? <WalletMultiButtonDynamic /> :
                        (publicKey && publicKey.toString()) ? <SignButtonDynamic /> : <WalletMultiButtonDynamic />}
                </div>
                {session && publicKey && publicKey.toString() ? <NFTImageList userId={(session?.user as any).id} walletId={publicKey.toString()} /> : <></>}
            </main>
            <footer className={styles.footer}>
                <CommonFooter />
            </footer>
        </div>
    );
};

export default Home;
