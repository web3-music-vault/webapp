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

    await tokensdb.delete({
      Key: {
        code: accessToken.accessToken
      }
    });


    // console.log('Found  accessToken - setting date to 0', Item)
    // const token = Item?.content;
    // token.accessTokenExpiresAt = new Date(0).toISOString();
    // token.refreshTokenExpiresAt = new Date(0).toISOString();
    // try {
    //   await this.persist(token)
    // } catch (e) {
    //   console.error(e)
    // }


  },
  async issueToken(client: OAuthClient, scopes: OAuthScope[], user: OAuthUser): Promise<OAuthToken> {
    console.log('OAuthTokenRepository.issueToken(client=', client, 'scopes=', scopes, 'user=', user)
    const oneHourInFuture = new DateInterval("1h").getEndDate();
    const oneYearInFuture = new DateInterval("360d").getEndDate();


    return <OAuthToken>{
      accessToken: uuid.v4(),
      accessTokenExpiresAt: oneHourInFuture,
      refreshTokenExpiresAt: oneYearInFuture,
      client,
      user,
      scopes: [],
    };
  },
  async persist(accessToken: OAuthToken): Promise<void> {
    console.log('OAuthTokenRepository.persist(accessToken=', accessToken)
    const accessTokenExpiresAt = accessToken.accessTokenExpiresAt?.toISOString()
    const refreshTokenExpiresAt = accessToken.refreshTokenExpiresAt?.toISOString()

    const accessTokenForDB = {
      ...accessToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt
    }
    const item = {
      code: accessToken.accessToken,
      content: accessTokenForDB,
      refreshToken: accessTokenForDB.refreshToken,
      createdAt: Date.now()
    }
    console.log('persisting', JSON.stringify(item))
    await tokensdb.put({
      Item: item
    })

    // inMemoryDatabase.tokens[accessToken.accessToken] = accessToken;
  },
  async getByRefreshToken(refreshTokenToken: string): Promise<OAuthToken> {
    console.log('OAuthTokenRepository.getByRefreshToken(refreshTokenToken=', refreshTokenToken)

    const { Items } = await tokensdb.getByRefreshToken(refreshTokenToken)
    if (Items && Items.length == 1) {
      console.log('retrieved authCode from:' + JSON.stringify( Items[0].content))
      const token =  Items[0].content;
      const accessTokenExpiresAt = new Date(token.accessTokenExpiresAt);
      const refreshTokenExpiresAt = new Date(token.refreshTokenExpiresAt);
      // const refreshTokenExpiresAt = null
      const tokenForDB = {
        ...token,
        refreshTokenExpiresAt,
        accessTokenExpiresAt
      }
      console.log('OAuthTokenRepository.getByRefreshToken(refreshTokenToken=', tokenForDB)
      return tokenForDB as OAuthToken;
    }
    throw new Error("token not found");
  },
  async isRefreshTokenRevoked(token: OAuthToken): Promise<boolean> {
    console.log('OAuthTokenRepository.isRefreshTokenRevoked(token=', token)
    return Date.now() > (token.refreshTokenExpiresAt?.getTime() ?? 0);
  },
  async issueRefreshToken(token): Promise<OAuthToken> {
    console.log('OAuthTokenRepository.issueRefreshToken(token=', token)
    const refreshToken = uuid.v4();
    const refreshTokenExpiresAt = new DateInterval("360d").getEndDate();
    // const refreshTokenExpiresAt = null

    const tokenForDB = {
      ...token,
      refreshToken,
      refreshTokenExpiresAt
    }

    try{
      const {Attributes}  = await tokensdb.update({
        TableName: process.env.AUTH_TOKENS_TABLE_NAME,
        Key: {
          code: token.accessToken,
        },
        UpdateExpression: `set refreshToken = :refreshToken`,
        // UpdateExpression: `set content.refreshToken = :refreshToken, content.refreshTokenExpiresAt = :refreshTokenExpiresAt`,

        ExpressionAttributeValues: {
          ":refreshToken": tokenForDB.refreshToken,
          // ":refreshTokenExpiresAt": tokenForDB.refreshTokenExpiresAt?.toISOString()
        },
        ReturnValues: 'ALL_NEW'
      })
      console.log('OAuthTokenRepository.issueRefreshToken(Attributes=', Attributes)

    }catch(e){
      console.error('unable to refresh token', e)
      throw new Error('Unable to refresh token')
    }

    // inMemoryDatabase.tokens[token.accessToken] = token;
    console.log('OAuthTokenRepository.issueRefreshToken(return ', token)
    return tokenForDB;
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
    const expiresAt = authCode.expiresAt.toISOString()
    const authCodeForDB = {
      ...authCode,
      expiresAt
    }

    
    const item = {
      code: authCode.code,
      content: authCodeForDB,
      createdAt: Date.now()
    }
    await dynamo.put({
      Item: item
    })
    // console.log('authCodes #', Object.keys(inMemoryDatabase.authCodes).length)
  },
  async isRevoked(authCodeCode: string): Promise<boolean> {
    console.log('OAuthAuthCodeRepository.isRevoked', 'authCodeCode', authCodeCode)
    console.log('isRevoked authCodeCode', authCodeCode)

    const authCode = await this.getByIdentifier(authCodeCode);

    console.log('isRevoked authCode', { authCode, authCodeCode }, 'expiresAt', authCode.expiresAt, ' Date.now() > authCode.expiresAt.getTime()',  Date.now() > authCode.expiresAt.getTime());

    return Date.now() > authCode.expiresAt.getTime()
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
      // convert ISO 8601 string to Date
      const expiresAt = new Date(Item.content.expiresAt)
      const authCodeFromDB = {
        ...Item.content,
        expiresAt
      }
  
      return authCodeFromDB as OAuthAuthCode;
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
      UpdateExpression: `set content.expiresAt = :expiresAt`,
      ExpressionAttributeValues: {
        ":expiresAt": new Date(0).toISOString()
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
