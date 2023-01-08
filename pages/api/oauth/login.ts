import * as querystring from "querystring";
import { destroyCookie, setCookie } from "nookies";
import { unstable_getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";

import { SERVER_COOKIES } from "../../../lib/oauth/oauth_authorization_server";
import { authOptions } from "../auth/[...nextauth]"


export default async function Login(req: NextApiRequest, res: NextApiResponse) {
  if (req?.method?.toLowerCase() !== "post") {
    res.status(400);
    res.send("unsupported method");
    return;
  }


  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }
  // const { email, password } = req.body;

  // const requestBody = req.body
  // console.log(requestBody)
  // const { walletId, signature, nonce } = requestBody;
  // const user = await loginWallet(walletId, signature, nonce)

  // const user = await inMemoryUserRepository.getUserByCredentials(email, password)

  const user = session.user;
  setCookie({ res }, SERVER_COOKIES.user, JSON.stringify(user), {
    path: "/",
    httpOnly: true,
  });
  
  destroyCookie({ res }, SERVER_COOKIES.authorized, {
    path: "/",
    httpOnly: true,
  });

  res.redirect("/api/oauth/authorize?" + querystring.stringify(req.query));
}
