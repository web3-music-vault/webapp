import base58 from "bs58";
import { sign } from 'tweetnacl';

// fetch darkblock info
export async function fetchDarkBlockInfo(tokenId: string) {

    const platform = 'Solana' // TODO bring from environment
    const url = `${process.env.NEXT_PUBLIC_DARKBLOCK_API}v1/darkblock/info?nft_id=${tokenId}&nft_platform=${platform}`
    try {
        const response = await fetch(url);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
        return data;

    } catch (error) {
        console.error('error', error)
    }
}

export async function isOwner(from: string, contract_id: string, token_id: string): Promise<boolean> {
    const platform = 'Solana' // TODO bring from environment
    const url = `${process.env.NEXT_PUBLIC_DARKBLOCK_API}v1/nft/owner?token_id=${token_id}&platform=${platform}&owner=${from}`
    try {
        const response = await fetch(url);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
        if (!data?.owner_address) {
            return false
        }
        return data.owner_address.toLowerCase() === from.toLowerCase();
    } catch (error) {
        console.error('error', error)
    }
    return false;
}


export async function auth(epoch: string, from: string, publicKey: any, signMessage:Function) {
    // wallet address

    if (!publicKey) throw new Error('Wallet not connected!');
    // `signMessage` will be undefined if the wallet doesn't support it
    if (!signMessage) throw new Error('Wallet does not support message signing!');

    // 
    // create string EPOCH + wallet address
    const e = epoch + from;

    // const msg = `You are unlocking content via the Darkblock Protocol.

    // Please sign to authenticate.
    
    // This request will not trigger a blockchain transaction or cost any fee.
    
    // Authentication Token: ${e}`
    const msg = `You are unlocking content via the Darkblock Protocol.\n\nPlease sign to authenticate.\n\nThis request will not trigger a blockchain transaction or cost any fee.\n\nAuthentication Token: ${e}`
    // const msg = 'You are unlocking content via the Darkblock Protocol.\n\nPlease sign to authenticate.\n\nThis request will not trigger a blockchain transaction or cost any fee.\n\nAuthentication Token: 1670098106398DjbKo9ik74KQ1sKx83xAx6D1sKz2riws75oXxDFeEcB'
    const message = new TextEncoder().encode(msg);
    const uint8arraySignature = await signMessage(message, "utf8");

    // Verify that the bytes were signed using the private key that matches the known public key
    if (!sign.detached.verify(message, uint8arraySignature, publicKey.toBytes())) throw new Error('Invalid signature!');
    const My = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    const encodedSignature = encodeURIComponent(((e) => {
        var t, i = new Uint8Array(e), n = i.length, r = "";
        for (t = 0; t < n; t += 3)
            r += My[i[t] >> 2],
            r += My[(3 & i[t]) << 4 | i[t + 1] >> 4],
            r += My[(15 & i[t + 1]) << 2 | i[t + 2] >> 6],
            r += My[63 & i[t + 2]];
        return n % 3 == 2 ? r = r.substring(0, r.length - 1) + "=" : n % 3 == 1 && (r = r.substring(0, r.length - 2) + "=="),
        r
    })(uint8arraySignature))
    console.log('signature', encodedSignature)
    return encodedSignature;

}
