import { OAuthAuthCode, OAuthClient, OAuthScope, OAuthToken, OAuthUser } from "@jmondi/oauth2-server";

export interface InMemory {
  // users: { [email: string]: OAuthUser };
  clients: { [id: string]: OAuthClient };
  authCodes: { [id: string]: OAuthAuthCode };
  tokens: { [id: string]: OAuthToken };
  scopes: { [id: string]: OAuthScope };
}


export const playNFTMusicScope: OAuthScope = {
  name: "library.read",
  description: "Allow your unlocked web3 music vault to play on Alexa",
};

export const sampleScope2: OAuthScope = {
  name: "contacts.write",
  description: "Allow write access to contacts",
};

// TODO move this to database
export const alexaClient: OAuthClient = {
  allowedGrants: ["authorization_code","refresh_token"],
  redirectUris: ['https://alexa.amazon.co.jp/api/skill/link/M2P5L2QTIQJR7V', 'https://layla.amazon.com/api/skill/link/M2P5L2QTIQJR7V', 'https://pitangui.amazon.com/api/skill/link/M2P5L2QTIQJR7V'],
  scopes: [playNFTMusicScope, sampleScope2],
  id: "alexa-skill-web3-music-vault",
  name: "Alexa Web3 Music Vault Skill",
  secret: process.env.ALEXA_SKILL_CLIENT_SECRET
};

export const inMemoryDatabase: InMemory = {
  clients: {
    [alexaClient.id]: alexaClient,
  },
  authCodes: {},
  tokens: {},
  scopes: {
    [playNFTMusicScope.name]: playNFTMusicScope,
    // [sampleScope2.name]: sampleScope2,
  },
//   users: {
//     // [sampleUser.email]: sampleUser,
//   },
};
