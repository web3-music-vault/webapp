// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from "next-auth/next"

import dynamo from '../../lib/music-library/dynamo';
import { LibraryItem } from '../../lib/defs/library-item';
import jwtDecode from 'jwt-decode';
import { authOptions } from './auth/[...nextauth]'


type DecodedJWT = {
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  cid: string;
  scope: string;

  email: string;
  isActive: boolean;
}

export type DecodedAccessToken = {
  token: string;
  expiresAt: number;
  userId: string;
  email: string;
  isActive: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LibraryItem[]>
) {

  // authorization token // need to validate that

  // console.log('req.headers.authorization', req.headers.authorization)
  let userId;
  if (req.headers.authorization) {
    let decodedJWT: DecodedJWT | any

    const authorizationHeader = req.headers.authorization.split(' ')
    const jwt = authorizationHeader[1]
    const authorizationType = authorizationHeader[0]
    if (authorizationType == 'Bearer') {
      decodedJWT = jwtDecode(jwt);
    } else {
      userId = await getUserFromJWT(req, res, userId);
    }

    if (decodedJWT) {
      const accessToken: DecodedAccessToken = {
        token: jwt,
        userId: decodedJWT.sub,
        expiresAt: decodedJWT.exp,
        email: decodedJWT.email,
        isActive: decodedJWT.isActive,
      };
      // user should be in here
      // make sure this token is not expired
      if (!(!(Date.now() / 1000 > (accessToken?.expiresAt ?? 0)))) {
        // not authorized
        res.status(401)
        return;
      }

      userId = accessToken.userId
    }


  } else {
    userId = await getUserFromJWT(req, res, userId);

  }

  if (!userId) {
    res.status(401)
    return;
  }


  if (req.method === 'GET') {
    const item = await dynamo.get({
      Key: {
        userId: userId
      }
    })

    console.log('GET', item)
    if (!item.Item) {
      res.status(404).json({} as LibraryItem[])
      return;
    }
    res.status(200).json(item.Item as LibraryItem[])
  }

  if (req.method === 'POST') {
    const body = JSON.parse(req.body)

    const { Attributes } = await dynamo.update({
      Key: {
        userId: userId
      },
      UpdateExpression: 'SET content = :content',
      ExpressionAttributeValues: {
        ':content': body.content || null
      },
      ReturnValues: 'ALL_NEW'
    })
    res.status(200).json(Attributes as LibraryItem[])
  }



}


async function getUserFromJWT(req: NextApiRequest, res: NextApiResponse<LibraryItem[]>, userId: any) {
  const session = await unstable_getServerSession(req, res, authOptions);
  console.log('session', session);
  userId = (session?.user as any).id;
  return userId;
}

