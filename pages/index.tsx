import { useWallet } from '@solana/wallet-adapter-react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React from 'react';
import { useSession, signOut } from "next-auth/react"
import styles from '../styles/Home.module.css';
import NFTImageList from '../components/NFTImageList';

// const WalletDisconnectButtonDynamic = dynamic(
//     async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
//     { ssr: false }
// );
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const SignButtonDynamic = dynamic(
  async () => (await import('../components/SignMessage')).SignMessage,
  { ssr: false }
);

const Home: NextPage = () => {

    const { publicKey,  } = useWallet();
    const { data: session } = useSession()

    const logout = async () => {
        await signOut()
    }

    // console.log('session', session)

    return (
        <div className={styles.container}>
            <Head>
                <title>Web3 Music Vault</title>
                <meta name="description" content="Web3 Music Vault a way to connect Un-lockable NFT music with Alexa" />
                <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png"/>
                <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png"/>
                <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png"/>
                <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png"/>
                <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png"/>
                <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png"/>
                <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png"/>
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png"/>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png"/>
                <link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
                <link rel="manifest" href="/manifest.json"/>
                <meta name="msapplication-TileColor" content="#ffffff"/>
                <meta name="msapplication-TileImage" content="/ms-icon-144x144.png"/>
                <meta name="theme-color" content="#ffffff"/>
            </Head>

            <main className={styles.main}>

            {/* <Container maxWidth="sm">
                <Box sx={{ bgcolor: '#cfe8fc', height: '100vh' }} />
            </Container> */}
                <h1 className={styles.title}>
                   Web3 Music Vault
                </h1>

                <div className={styles.walletButtons}>
                    {session && publicKey && publicKey.toString() ? <WalletMultiButtonDynamic /> : 
                        (publicKey && publicKey.toString()) ?  <SignButtonDynamic/> : <WalletMultiButtonDynamic/>}
                    

                </div>

                
                {session && publicKey && publicKey.toString() ? <NFTImageList userId={(session?.user as any).id} walletId={publicKey.toString()}/> : <></>}
                {/* {session ? (
                    
                    <>
                        Signed in as {session?.user?.email} <br />
                        <button onClick={() => signOut()}>Sign out</button>
                    </>
                    
                ):
                (
                    <>
                    Not signed in <br />
                    <button onClick={() => signIn()}>Sign in</button>
                    </>
                )} */}

         

         
            </main>

            {/* <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
                        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
                    </span>
                </a>
            </footer> */}
        </div>
    );
};

export default Home;
