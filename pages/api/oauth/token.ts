import { OAuthResponse } from "@jmondi/oauth2-server";
import type { NextApiRequest, NextApiResponse } from 'next'
import handleError from "../../../lib/handle_error";

import { inMemoryAuthorizationServer } from "../../../lib/oauth/oauth_authorization_server";

const authorizationServer = inMemoryAuthorizationServer;

export default async function Token(req: NextApiRequest, res: NextApiResponse) {
  if (req?.method?.toLowerCase() !== "post") {
    res.status(400);
    res.send("unsupported method");
    return;
  }
  console.log('token request', req)

  new OAuthResponse(res);

  try {
    const tokenResponse = await authorizationServer.respondToAccessTokenRequest(req);
    Object.keys(tokenResponse.headers).forEach(key => res.setHeader(key, tokenResponse.headers[key]));
    res.status(tokenResponse.status).send(tokenResponse.body);
  } catch (e) {
    console.error(e)
    handleError(e, res);
    return;
  }
}
