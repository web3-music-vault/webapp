


import { verify } from 'hcaptcha';
import { NextApiRequest, NextApiResponse } from 'next';

const secret = (process.env.HCAPTCHA_SECRET as string);
// const token = 'token from widget';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{verification:boolean}>
) {

    const requestBody = JSON.parse(req.body)
    const token = requestBody.token;
    console.log('requestBody', requestBody)
    console.log('secret', secret)
    console.log('token', token)
    verify(secret, token)
        .then((data) => {
            console.log('data', data)
            if (data.success === true) {
                console.log('success!', data);
                res.status(200).json({verification:true})
                
            } else {
                console.log('verification failed');
                res.status(403)

            }
        })
        .catch((e) => {
            console.log('failed to verify', e)
            throw new Error(e)
        });

}