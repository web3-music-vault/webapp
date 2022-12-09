export function createMessage(walletId:string, nonce:string){
    return `Login to Smart Media Vault using wallet
    address: ${walletId?.toString()}
    accessKey: ${nonce}`
}