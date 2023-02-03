import type { NextApiRequest, NextApiResponse } from 'next'
import { OAuthRequest } from "@jmondi/oauth2-server";

import { inMemoryAuthorizationServer, SERVER_COOKIES } from "../../../lib/oauth/oauth_authorization_server";
import * as querystring from "querystring";
import  handleError from "../../../lib/handle_error";

const authorizationServer = inMemoryAuthorizationServer;

export default async function authorize(req: NextApiRequest, res: NextApiResponse) {
  const request = new OAuthRequest(req);
  console.log('authorize request', request)

  try {
    // Validate the HTTP request and return an AuthorizationRequest.
    const authRequest = await authorizationServer.validateAuthorizationRequest(request);

    // console.log('req.cookies[SERVER_COOKIES.user]', req.cookies[SERVER_COOKIES.user])
    // You will probably redirect the user to a login endpoint.
    const user = req.cookies[SERVER_COOKIES.user];

    if (!user) {
      res.redirect("/oauth/login?" + querystring.stringify(req.query as any ?? {}))
      return;
    }
    // After login, the user should be redirected back with user in the session.
    // You will need to manage the authorization query on the round trip.
    // The auth request object can be serialized and saved into a user's session.

    // Once the user has logged in set the user on the AuthorizationRequest
    authRequest.user = JSON.parse(user);

    // Once the user has approved or denied the client update the status
    // (true = approved, false = denied)
    // authRequest.isAuthorizationApproved = getIsAuthorizationApprovedFromSession();
    authRequest.isAuthorizationApproved = !!req.cookies[SERVER_COOKIES.authorized];

    // If the user has not approved the client's authorization request,
    // the user should be redirected to the approval screen.
    if (!authRequest.isAuthorizationApproved) {
      // This form will ask the user to approve the client and the scopes requested.
      // "Do you authorize Jason to: read contacts? write contacts?"
      res.redirect("/oauth/verify_scopes?" + querystring.stringify(req.query as any ?? {}))
      return;
    }

    // At this point the user has approved the client for authorization.
    // Any last authorization requests such as Two Factor Authentication (2FA) can happen here.


    // Redirect back to redirect_uri with `code` and `state` as url query params.
    const response = await authorizationServer.completeAuthorizationRequest(authRequest);
    res.status(response.status);
    res.redirect(response.headers.location);
  } catch (e) {
    console.error(e)
    handleError(e, res);
  }
}
