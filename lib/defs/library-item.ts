export interface LibraryItem {
  /** 
   * tokenId - nft token id
  */
  tokenId: string;
  /**
   * walletId - used to store the wallet reference when using account linking
   */
  walletId: string;
  /**
   * userId - federated user id that can be used to link multiple wallets and multiple wallet chains
   */
  userId: string;
  /**
   * platform - to support multiple chains starting with Solana wallets
   */
  platform: string;
  /**
   * audioUrl - the primary url that will be used to play audio.
   */
  url: string;

  /**
   * mime type for content - capture the content type which can be used to handle different content types in client
   */

  mimeType: string;

  /**
   * title -  used to introduce song and the last song
   */
  title: string;
  /**
   * collection - used to introduce the song
   */
  collection: string;

  /**
   * creator
   */
  creator?: string

  /**
   * unlocked on
   */
  unlockedOn: number

  /**
   * metadata - TODO
   */
}