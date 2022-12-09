export interface NFTItem {
    // data from NFT Quick node
    chain: 'SOL'|'ETH';
    collectionAddress: string;
    collectionName: string;
    creators: {address:string, share:number, verified:number}[];
    description: string;
    imageUrl:string;
    animationUrl?:string;
    name: string
    network: string
    tokenAddress:string
}