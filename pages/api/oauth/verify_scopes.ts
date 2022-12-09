import * as querystring from "querystring";
import { setCookie } from "nookies";
import { NextApiRequest, NextApiResponse } from "next";

import { inMemoryUserRepository } from "../../../lib/oauth/repository";
import { SERVER_COOKIES } from "../../../lib/oauth/oauth_authorization_server";

export default async function VerifyScopes(req: NextApiRequest, res: NextApiResponse) {
  if (req?.method?.toLowerCase() !== "post") {
    res.status(400);
    res.send("unsupported method");
    return;
  }

  const { accepted } = req.body;

  if (accepted !== "true") {
    res.redirect("/");
    return;
  }

  setCookie({ res }, SERVER_COOKIES.authorized, "true", {
    path: "/",
    httpOnly: true,
  });

  res.redirect("/api/oauth/authorize?" + querystring.stringify(req.query));
}
