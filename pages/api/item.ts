// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import * as uuid from 'uuid';
import dynamo from '../../lib/dynamo';

type Item = {
  walletId: string
  nonce?: string
  
}

export  default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Item>
) {

  if(req.method === 'PUT'){
    const item = {
      walletId: uuid.v4(),
      content: req.body.content,
      createdAt: Date.now()
    }
  
    await dynamo.put({
      Item: item
    })
  
    res.status(200).json(item)
  }

  if(req.method === 'GET'){
    const {Item} = await dynamo.get({
      Key: {
        walletId: req.query.id
      }
    })
  }

  if(req.method === 'POST'){
    const {Attributes} = await dynamo.update({
      Key: {
        walletId: req.body.id
      },
      UpdateExpression: 'SET content = :content',
      ExpressionAttributeValues: {
        ':content': req.body.content || null
      },
      ReturnValues: 'ALL_NEW'
    })
    res.status(200).json(Attributes as Item)
  }

  if(req.method === 'DELETE'){
    await dynamo.delete({
      Key: {
        walletId: req.body.id
      }
    })
    res.status(204).json({walletId: req.body.id})
  }



}


