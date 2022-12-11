export function createMessage(walletId:string, nonce:string){
    return `Login to Web3 Music Vault using wallet
    address: ${walletId?.toString()}
    accessKey: ${nonce}`
}