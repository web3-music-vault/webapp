const AWS = require('aws-sdk');

import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import NextAuth, { NextAuthOptions } from "next-auth"

import CredentialsProvider from "next-auth/providers/credentials"
import { getCredentials, getIdToken, validateSig } from "../lib/credential";
import { getNonce, updateNonce } from "../lib/nonce";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options


const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_KEY as string,
  },
  region: process.env.REGION,
};

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

// export default async function auth(req: any, res: any) {

const providers = [CredentialsProvider({
  // The name to display on the sign in form (e.g. 'Sign in with...')
  name: 'Solana',
  // The credentials is used to generate a suitable form on the sign in page.
  // You can specify whatever fields you are expecting to be submitted.
  // e.g. domain, username, password, 2FA token, etc.
  // You can pass any HTML attribute to the <input> tag through the object.
  credentials: {
    walletId: { label: "walletId", type: "text", },
    signature: { label: "signature", type: "password" },
    nonce: { label: "nonce", type: "text" }
  },
  // @ts-ignore
  async authorize(credentials: { walletId: any; signature: any; nonce: any; }, req: any) {
    // You need to provide your own logic here that takes the credentials
    // submitted and returns either a object representing a user or value
    // that is false/null if the credentials are invalid.
    // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
    // You can also use the `req` object to obtain additional parameters
    // (i.e., the request IP address)
    console.log('authorizing', credentials)
    const { Items: nonces } = await getNonce(credentials.walletId);
    const { walletId, signature, nonce } = credentials;
    const requestNonce = nonce;
    if (nonces && nonces.length > 0) {
      const { nonce } = AWS.DynamoDB.Converter.unmarshall(nonces[0]);
      // const requestNonce = requestBody.nonce
      if (requestNonce !== nonce) {
        return;
      }
      const sigValidated = await validateSig(walletId, signature, nonce);

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
        console.log('credentialsObj', credentialsObj)

        const { Credentials: credentials } = credentialsObj

        // const { Credentials: credentials } = await getCredentials(
        //     identityId,
        //     token
        // );

        // console.log('credentials', credentials);
        //change nonce at final step
        await updateNonce(walletId);
        const data = {
          id: identityId,
          walletId,
          token
        }
        console.log('returning data', data)
        return data;
        // If no error and we have user data, return it


      }
      // Return null if user data could not be retrieved
      return null
    }
  }

})]

export const authOptions: NextAuthOptions = {
  providers,
  // TODO when using email method
  // adapter: DynamoDBAdapter(
  //   client
  // ),
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    verifyRequest: '/',
    newUser: '/'

  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // async session({ session, token }: { session: any; token: any }) {
    //   session.address = token.sub
    //   session.user.name = token.sub
    //   // session.user.image = "https://www.fillmurray.com/128/128"
    //   console.log('token', token)
    //   console.log('session', session)
    //   return session
    // },
    async jwt({ token, user }) {
      // const isSignIn = user ? true : false
      console.log('jwt token', token, 'user', user)
      if (user) {
        token.id = user.id;
        // TODO find user definition update
        if (!token.wallets) {
          token.wallets = {
            'solana': (user as any).walletId
          }
        }
        // token.accessToken = 
        // token.password = user
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any; }) {
      return { ...session, user: { id: token.id, wallets: token.wallets } };
    },
  },
};


export default NextAuth(authOptions)
