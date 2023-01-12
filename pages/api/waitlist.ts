import { NextApiRequest, NextApiResponse } from "next";
import validator from "email-validator"
import { getUserFromJWT } from "./lib/credential";
import dynamodb from "../../lib/profile/dynamodb";


type WaitListConfirmation = {
    // TODO properties that are in response
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<WaitListConfirmation>
  ) {
    // post request with email address
    // also check headers for public key / wallet
    
    if (req.method === 'POST') {
        await postHandler(req, res);
    } else {
        res.status(404).send("");
    }

  }


async function postHandler(req: NextApiRequest, res: NextApiResponse<WaitListConfirmation>) {
    const body = JSON.parse(req.body);
    const email = parseAndValidateEmail(body, res);
    const userId = await getUserFromJWT(req, res);

    await saveEmail(userId, email);
    res.status(200).send("")
}

async function saveEmail(userId: string, email:string) {
    console.log('userId', userId)
    console.log("Got email: " + email)

    const item = {
        userId,
        email,
        createdAt: Date.now()
      }
      await dynamodb.put({
        Item: item
      })
    // save in db

    // save 
}

// Make sure we receive a valid email
function parseAndValidateEmail(body: any, res: NextApiResponse<WaitListConfirmation>) {
    if (!body) {
        res.status(400).send("Malformed request");
    }

    const email = body["email"]
    if (!email) {
        res.status(400).send("Missing email");
    } else if (email.length > 300) {
        res.status(400).send("Email is too long");
    } else if (!validator.validate(email)) {
        res.status(400).send("Invalid email");
    }

    return email
}