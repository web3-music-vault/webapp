import { NextApiRequest, NextApiResponse } from "next";
import { loginWallet } from "./lib/login";

type Item = {
    walletId: string
    nonce?: string
    login?: boolean
    token?: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Item>
) {

    const requestBody = req.body
    console.log(requestBody)
    const { walletId, signature, nonce } = requestBody;
    const result = await loginWallet(walletId, signature, nonce)
    if (result) {
        res.status(200), result
    }
    res.status(401).json({
        walletId,
        login: false
    })

};

