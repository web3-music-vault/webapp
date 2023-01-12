import { useWallet } from '@solana/wallet-adapter-react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { signOut, useSession } from "next-auth/react"
import styles from '../styles/Home.module.css';
// import NFTImageList from '../components/NFTImageList';
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

const WalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
    { ssr: false }
  );

const NFTImageListDynamic =  dynamic(
    async () => (await import('../components/NFTImageList')).NFTImageList,
    { ssr: false }
);

const WaitListDynamic =  dynamic(
    async () => (await import('../components/WaitList')).WaitList,
    { ssr: false }
);

const CaptchaDynamic = dynamic(
    async () => (await import('../components/Captcha')).Captcha,
    { ssr: false }
);

const Home: NextPage = () => {

    const { publicKey, disconnecting } = useWallet();
    const [isHuman, setIsHuman] = useState(false)
    // TODO pull this info from local storage
    const [captchaToken, setCaptchaToken]  = useState(null);

    const { data: session } = useSession({
        required:true,
        onUnauthenticated() {
            console.log('unauthenticated')
        }
    })

    const logout = async () => {
        const signedOut = await signOut()
        console.log('signed out', signedOut)
      }
    
     useEffect(()=> {
        if(disconnecting && publicKey){
          logout()
        }
      }, [disconnecting, publicKey])

      const onHumanDetected = (verified:boolean) => {
        console.log('onHumanDetected', verified)
        setIsHuman(verified)
      }
    

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
                {/**
                 *  multiple stages for login
                 *  connect solana wallet (we have a public key for wallet)
                *   are you human? HCaptcha
                 *  signature (proof of wallet ownership)
                 *  session (session to allow for actions to happen)
                 * // load user profile...
                 *  is your wallet allowed to use alexa feature? yes / no
                 *  are you on the waitlist?
                 * 
                 */}

                <div className={styles.walletButtons}>
                    {/** if session and public key show wallet multi button */}
                    {  (isHuman) ? (session && publicKey && publicKey.toString() ? <WalletMultiButtonDynamic /> :
                       
                        /** if connected but no session show Login button and disconnect */
                         (publicKey && publicKey.toString()) ? <> <SignButtonDynamic />  <WalletDisconnectButtonDynamic /></> : 
                         /** Show multi button which allows for copying wallet address, switching wallet and disconnecting wallet */
                         <WalletMultiButtonDynamic />) : 
                          /** Not human */
                         <CaptchaDynamic onHumanDetected={onHumanDetected}/>
                        }
                </div>
                {session && publicKey && publicKey.toString() ? <WaitListDynamic  userId={(session?.user as any).id} walletId={publicKey.toString()} />: <></>}
                {session && publicKey && publicKey.toString() ? <NFTImageListDynamic userId={(session?.user as any).id} walletId={publicKey.toString()} /> : <></>}
            </main>
            <footer className={styles.footer}>
                <CommonFooter />
            </footer>
        </div>
    );
};

export default Home;
