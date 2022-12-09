const AWS = require('aws-sdk');
import { getCredentials, getIdToken, validateSig } from "./credential";
import { getNonce, updateNonce } from "./nonce";


export async function loginWallet(walletId: any, signature: any, nonce: string): Promise<{ walletId: string, nonce: string, token: string }> {

    const { Items: nonces } = await getNonce(walletId);

    if (nonces && nonces.length > 0) {
        const { nonce: dbNonce } = AWS.DynamoDB.Converter.unmarshall(nonces[0]);
        const requestNonce = nonce
        if (requestNonce !== dbNonce) {
            throw new Error('Unable to login')
            //  res.status(401).json({
            //      walletId,
            //      login: false
            //  })
            //  return 
        }
        const sigValidated = await validateSig(walletId, signature, dbNonce);
        if (sigValidated) {
            console.log('validated signature now getting tokenId from cognito')
            const tokenObj = await getIdToken(
                walletId
            );
            console.log('tokenObj', tokenObj)
            const { IdentityId: identityId, Token: token } = tokenObj;
            // const { IdentityId: identityId, Token: token } = await getIdToken(
            //     walletId
            // );

            // console.log('identityId', identityId);
            // console.log('token', token);


            const credentialsObj = await getCredentials(
                identityId,
                token
            );
            // console.log('credentialsObj', credentialsObj)

            const { Credentials: credentials } = credentialsObj

            // const { Credentials: credentials } = await getCredentials(
            //     identityId,
            //     token
            // );

            // console.log('credentials', credentials);
            //change nonce at final step
            const newNonce = await updateNonce(walletId);
            const data = {
                walletId,
                token,
                nonce: newNonce.nonce
            }
            //  res.status(200).json(data)
            return data
        }

    }
    throw new Error('Unable to login')

}

