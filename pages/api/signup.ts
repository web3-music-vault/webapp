
import type { NextApiRequest, NextApiResponse } from 'next'

import { updateNonce } from './lib/nonce';

type Request = {
  walletId: string
};
type Response = {
  nonce?: string
  error?: string
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const requestBody = req.body as Request
  // console.log('requestBody', requestBody)
  const { walletId } = requestBody;
  // console.log('walletId', walletId)
  if (!walletId) {
    res.status(400).json({ "error": "No Wallet Id provided" })
    return;
  }

  const response = await updateNonce(walletId);
  res.status(200).json(response)

}