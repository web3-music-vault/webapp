const crypto = require('crypto');
const AWS = require('aws-sdk');
AWS.config.region = process.env.REGION

const cognitoidentity = new AWS.CognitoIdentity({
    accessKeyId: process.env.IDPOOL_ACCESS_KEY,
    secretAccessKey: process.env.IDPOOL_SECRET_KEY
});
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { createMessage } from '../../../lib/createMessage';
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { LibraryItem } from '../../../lib/defs/library-item';
import { authOptions } from '../auth/[...nextauth]';

export function getIdToken(walletId: string) {
    const param = {
        IdentityPoolId: process.env.IDENTITY_POOL_ID,
        Logins: {} as any,
        // Region: process.env.REGION
    };
    const providerName = process.env.DEVELOPER_PROVIDER_NAME as string
    param.Logins[providerName] = walletId;
    return cognitoidentity.getOpenIdTokenForDeveloperIdentity(param).promise();
}

export async function getUserFromJWT(req: NextApiRequest, res: NextApiResponse<LibraryItem[]>) {
    const session = await unstable_getServerSession(req, res, authOptions);
    return (session?.user as any).id;
  }

export function getCredentials(identityId: string, cognitoOpenIdToken: string) {
    const params = {
        IdentityId: identityId,
        Logins: {} as any,

    };
    params.Logins['cognito-identity.amazonaws.com'] = cognitoOpenIdToken;
    return cognitoidentity.getCredentialsForIdentity(params).promise();
}

export async function validateSig(walletId: string, signature: string, nonce: string) {

    // const message = `Welcome message, nonce: ${nonce}`;
    // const hash = web3.utils.sha3(message);
    // const signing_address = await web3.eth.accounts.recover(hash, signature);

    const message = createMessage(walletId, nonce)
    const verified = nacl
        .sign
        .detached
        .verify(
            new TextEncoder().encode(message),
            bs58.decode(signature),
            bs58.decode(walletId)
        )
    return verified;
}
