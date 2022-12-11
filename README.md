# Web3 Music Vault

## Alexa, Ask Web3 Music Vault to Play My NFTs!

## TLDR; 

The Web3 Music Vault gives NFT Music Fans the ability to unlock NFT music for as long as they possess an NFT or to get temporary access via a content access NFT and play it on Alexa.


## Wallet Prerequisites


 1. A Solana NFT with Unlockable Dark Block Music (mp3 file) either the full ownership and/or a time based access NFT.
  - Using third web created music NFTs with AI music generator

## Music Fan Journey


### Initial setup
1. Connect their wallet to web3musicvault.xyz
2. Login with Solana wallet
3. Select + on NFTs that have un-lockable music
4. Install the Alexa skill Web3 Music Vault 
5. Account link


### On going
1. Alexa, Ask Web3 Music Vault to Play My NFTs!
2. Pay musician for Content NFT or Access NFT or pay previous owner for NFT and optionally pay royalty.
3. When needed open the vault to add more songs


## Publishing Music Journey


### Initial setup
1. Publish Music Album Solana NFT (I used thirdweb solana)
2. Upgrade NFT with Darkblock un-lockable music songs
3. Setup NFT sale - for the main music albums - like selling rights to the song for as long as the holder has the song in their wallet.
4. Setup NFT access tokens which can provide time based access.


### On going
1. Receive primary NFT payments
2. Receive royalties (maybe)
3. Receive payment for access NFT (consumption payments)


## Web3 Music Vault Software Components


1. Web app - front end  (in this repo)
   1. Connect with Solana wallet
   2. Login in with Solana
   3. View NFTs using QuickNode api
   4. Unlock Music NFTs using darkblock.io protocol
   5. Add/Remove songs to a playlist
2. Web app backend (in this repo)
   1. Using AWS cognito identity pool to manage federated logins (future Sign in with X wallet)
   2. Using AWS DynamoDB for storage of unlockable songs to play
   3. Basic OAUTH implementation that allows for Solana wallet linking in Alexa
   4. API wrapper for accessing QuickNode
3. Alexa Skill (in the alexa-skill repo)
   1. Ability to ask Alexa to play audio which uses the OAUTH account linking to pull in the unlocked song information.

