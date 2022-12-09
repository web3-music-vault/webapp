import type { NextApiRequest, NextApiResponse } from 'next'
import { getClaimsFromToken } from './lib/claims';
import { getCredentials } from './lib/credential';


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

    if (!req.headers.authorization) {
        res.status(400).json({ "error": "Invalid input" })
        return;
    }

    const claims = getClaimsFromToken(req.headers.authorization)

    if (claims) {
        try {
            const credentials = await getCredentials(claims.sub, req.headers.authorization)
            console.log('credentials', credentials)
            console.log('claims', claims)
        } catch (e) {
            res.status(401).json({ "error": "Not authorized" })

        }

    }

    res.status(200).json(claims as any)

}

