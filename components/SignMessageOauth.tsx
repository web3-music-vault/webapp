import { Button } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { sign } from 'tweetnacl';
import { useAuth } from '../context/authContext';
import { createMessage } from '../lib/createMessage';
// import { useNotify } from './notify';

export const SignMessageOauth: FC = () => {
    const { publicKey, signMessage } = useWallet();
    const { nonce, setSignature, token, logout } = useAuth()
    // const notify = useNotify();


    const onClick = useCallback(async () => {
        try {

            if (!publicKey) throw new Error('Wallet not connected!');
            if (!nonce) throw new Error('No Nonce available')
            if (!signMessage) throw new Error('Wallet does not support message signing!');
            const messageStr = createMessage(publicKey.toString(), nonce)
            console.log('message', messageStr)
            const message = new TextEncoder().encode(messageStr)
            // const message = new TextEncoder().encode('Hello, world!');
            const signature = await signMessage(message);
            if (!sign.detached.verify(message, signature, publicKey.toBytes()))
                throw new Error('Message signature invalid!');

            console.log('success', `Message signature: ${bs58.encode(signature)}`);
            setSignature(bs58.encode(signature))

            // call verify on server get identity token 


        } catch (error: any) {
            console.log('error', `Message signing failing: ${error?.message}`);
        }
    }, [publicKey, nonce, signMessage, setSignature]);

    return (
        <Button variant="contained" onClick={onClick} disabled={!publicKey || !signMessage}>
            Login with Solana
        </Button>
    );
};
