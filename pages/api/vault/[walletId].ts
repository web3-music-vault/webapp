import { authOptions } from '../auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"
import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type Item = {
    message: string
    nonce?: string
  }
  
  export  default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Item>
  ) {

    // session or oauth resource access is ok...
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }
  const { walletId, page } = req.query

  if(!walletId){
    return res.status(400).json({
      message: "Missing wallet param"
    })
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const data = {
    jsonrpc: "2.0",
    id: 1,
    method: "qn_fetchNFTs",
    params: {
      wallet: walletId,
      omitFields: ["provenance", "traits"],
      page,
      perPage: 20,
    },
  };
  // TODO noticed collection name is Unknown for all Solana nfts.. 
  const result = await axios
    .post(process.env.QUICK_NODE_URL as string, data, config)


  const dataResult = result.data.result;

  return res.json(dataResult)
}

