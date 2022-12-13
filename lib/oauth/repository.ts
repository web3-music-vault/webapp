import {
  DateInterval,
  ExtraAccessTokenFields,
  GrantIdentifier,
  OAuthAuthCode,
  OAuthAuthCodeRepository,
  OAuthClient,
  OAuthClientRepository,
  OAuthScope,
  OAuthScopeRepository,
  OAuthToken,
  OAuthTokenRepository,
  OAuthUser,
  OAuthUserRepository,
} from "@jmondi/oauth2-server";
import { inMemoryDatabase } from "./database";
import dynamo from "./dynamo";
import * as uuid from 'uuid';
import tokensdb from "./tokensdb";


export const inMemoryClientRepository: OAuthClientRepository = {
  async getByIdentifier(clientId: string): Promise<OAuthClient> {
    console.log('OAuthScopeRepository.getByIdentifier', 'clientId', clientId)
    return inMemoryDatabase.clients[clientId];
  },

  async isClientValid(grantType: GrantIdentifier, client: OAuthClient, clientSecret?: string): Promise<boolean> {
    console.log('OAuthScopeRepository.isClientValid', 'grantType', grantType, 'client', client)

    if (client.secret !== clientSecret) {
      return false;
    }

    if (!client.allowedGrants.includes(grantType)) {
      return false;
    }

    return true;
  },
};

export const inMemoryScopeRepository: OAuthScopeRepository = {
  async getAllByIdentifiers(scopeNames: string[]): Promise<OAuthScope[]> {
    console.log('OAuthScopeRepository.getAllByIdentifiers', 'scopeNames', scopeNames)
    return Object.values(inMemoryDatabase.scopes).filter(scope => scopeNames.includes(scope.name));
  },
  async finalize(
    scopes: OAuthScope[],
    identifier: GrantIdentifier,
    client: OAuthClient,
    user_id?: string,
  ): Promise<OAuthScope[]> {
    console.log('OAuthScopeRepository.finalize', 'scopes', scopes, 'identifier', identifier, 'client', client, 'user_id', user_id)
    return scopes;
  },
};

export const dbAccessTokenRepository: OAuthTokenRepository = {

  async revoke(accessToken: OAuthToken): Promise<void> {
    console.log('OAuthTokenRepository.revoke(accessToken=', accessToken)

    const { Item } = await tokensdb.get({
      Key: {
        code: accessToken.accessToken
      }
    });

    if (!Item) {
      console.log('No token found to revoke', ' accessToken.accessToken', accessToken.accessToken)
    }

    console.log('Found  accessToken - setting date to 0', Item)
    const token = Item?.content as OAuthToken;
    token.accessTokenExpiresAt = new Date(0);
    token.refreshTokenExpiresAt = new Date(0);
    try {
      await this.persist(token)
    } catch (e) {
      console.error(e)
    }


  },
  async issueToken(client: OAuthClient, scopes: OAuthScope[], user: OAuthUser): Promise<OAuthToken> {
    console.log('OAuthTokenRepository.issueToken(client=', client, 'scopes=', scopes, 'user=', user)
    const oneHourInFuture = new DateInterval("1h").getEndDate();

    return <OAuthToken>{
      accessToken: uuid.v4(),
      accessTokenExpiresAt: oneHourInFuture,
      client,
      user,
      scopes: [],
    };
  },
  async persist(accessToken: OAuthToken): Promise<void> {
    console.log('OAuthTokenRepository.persist(accessToken=', accessToken)
    const item = {
      code: accessToken.accessToken,
      content: accessToken,
      createdAt: Date.now()
    }
    await tokensdb.put({
      Item: item
    })

    // inMemoryDatabase.tokens[accessToken.accessToken] = accessToken;
  },
  async getByRefreshToken(refreshTokenToken: string): Promise<OAuthToken> {
    console.log('OAuthTokenRepository.persist(refreshTokenToken=', refreshTokenToken)

    const { Items } = await tokensdb.getByRefreshToken(refreshTokenToken)
    if (Items && Items.length == 1) {
      console.log('retrieved authCode from:' + JSON.stringify(Items))
      return Items[0].content as OAuthToken;
    }
    throw new Error("token not found");
  },
  async isRefreshTokenRevoked(token: OAuthToken): Promise<boolean> {
    console.log('OAuthTokenRepository.isRefreshTokenRevoked(token=', token)
    return Date.now() > (token.refreshTokenExpiresAt ?? 0);
  },
  async issueRefreshToken(token): Promise<OAuthToken> {
    console.log('OAuthTokenRepository.issueRefreshToken(token=', token)
    token.refreshToken = uuid.v4();
    token.refreshTokenExpiresAt = new DateInterval("1h").getEndDate();
    await tokensdb.update({
      TableName: process.env.AUTH_TOKENS_TABLE_NAME,
      Key: {
        code: token.accessToken,
      },
      UpdateExpression: `set refreshToken = :refreshToken, refreshTokenExpiresAt = :refreshTokenExpiresAt`,
      ExpressionAttributeValues: {
        ":refreshToken": token.refreshToken,
        ":refreshTokenExpiresAt": token.refreshTokenExpiresAt
      },
      ReturnValues: 'ALL_NEW'
    })
    // inMemoryDatabase.tokens[token.accessToken] = token;
    return token;
  },
};

export const inMemoryAuthCodeRepository: OAuthAuthCodeRepository = {
  issueAuthCode(client: OAuthClient, user: OAuthUser | undefined, scopes: OAuthScope[]): OAuthAuthCode {
    const oneHourInFuture = new DateInterval("1h").getEndDate();

    console.log('OAuthAuthCodeRepository.issueAuthCode', 'client', client, 'user', user, 'scopes', scopes)
    console.log('oneHourInFuture', oneHourInFuture)
    return {
      code: uuid.v4(),
      user,
      client,
      redirectUri: "",
      codeChallenge: undefined,
      codeChallengeMethod: undefined,
      expiresAt: oneHourInFuture,
      scopes: [],
    };
  },
  async persist(authCode: OAuthAuthCode): Promise<void> {
    // console.log('persist authCode', authCode)
    // inMemoryDatabase.authCodes[authCode.code] = authCode;
    const item = {
      code: authCode.code,
      content: authCode,
      createdAt: Date.now()
    }
    await dynamo.put({
      Item: item
    })
    // console.log('authCodes #', Object.keys(inMemoryDatabase.authCodes).length)
  },
  async isRevoked(authCodeCode: string): Promise<boolean> {
    console.log('OAuthAuthCodeRepository.isRevoked', 'authCodeCode', authCodeCode)

    console.log('isRevoked authCode', authCodeCode)
    const authCode = await this.getByIdentifier(authCodeCode);
    console.log({ authCode, authCodeCode }, inMemoryDatabase);
    return Date.now() > new Date(authCode.expiresAt).getTime()
  },
  async getByIdentifier(authCodeCode: string): Promise<OAuthAuthCode> {
    console.log('OAuthAuthCodeRepository.getByIdentifier', 'authCodeCode', authCodeCode)

    const { Item } = await dynamo.get({
      Key: {
        code: authCodeCode
      }
    })

    if (Item) {
      console.log('retrieved authCode from:' + JSON.stringify(Item?.content))
      return Item.content as OAuthAuthCode;
    }

    throw new Error("Not AuthCode found");

    // return authCode
  },
  async revoke(authCodeCode: string): Promise<void> {
    console.log('OAuthAuthCodeRepository.revoke', 'authCodeCode', authCodeCode)
    // update 

    await dynamo.update({
      Key: {
        code: authCodeCode
      },
      UpdateExpression: `set expiresAt = :expiresAt`,
      ExpressionAttributeValues: {
        ":expiresAt": new Date(0).getTime()
      },
    })

    // inMemoryDatabase.authCodes[authCodeCode].expiresAt = new Date(0);
  },
};

export const inMemoryUserRepository: OAuthUserRepository = {
  async getUserByCredentials(
    identifier: string,
    password?: string,
    grantType?: GrantIdentifier,
    client?: OAuthClient,
  ): Promise<OAuthUser | undefined> {
    console.log('OAuthUserRepository.getUserByCredentials', 'identifier', identifier, 'grantType', grantType, 'client', client)
    return {
      id: identifier
    }
    // const user = inMemoryDatabase.users[identifier];
    // if (user?.password !== password) return;
    // return user;
  },
  async extraAccessTokenFields(user: OAuthUser): Promise<ExtraAccessTokenFields | undefined> {
    console.log('OAuthUserRepository.extraAccessTokenFields', 'user', user)
    return {

    };
  },
};
