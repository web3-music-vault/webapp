import crypto from "crypto";
import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";
import querystring from "querystring";
import { createContext, useContext, useState } from "react";
import { base64urlencode } from "@jmondi/oauth2-server";

import { alexaClient, playNFTMusicScope, sampleScope2 } from "./oauth/database";
import { destroyCookie, parseCookies, setCookie } from "nookies";

type DecodedJWT = {
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  cid: string;
  scope: string;

  email: string;
  isActive: boolean;
}

export type DecodedAccessToken = {
  token: string;
  expiresAt: number;
  userId: string;
  email: string;
  isActive: string;
}

type DecodedRefreshToken = {
  token: string;
  expiresAt: number;
  userId: string;
}

// @ts-ignore
const AuthContext = createContext<UseAuth>();

export enum COOKIE {
  accessToken = "client__accessToken",
  refreshToken = "client__refreshToken",
  auth = "client__auth",
}

function createOAuthSecurity() {
  const state = base64urlencode(crypto.randomBytes(5));
  const codeVerifier = base64urlencode(crypto.randomBytes(40));
  const codeChallenge = base64urlencode(crypto.createHash("sha256").update(codeVerifier).digest("hex"));
  return { state, codeVerifier, codeChallenge };
}

function AuthProvider(props: any) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<DecodedAccessToken | undefined>();
  const [, setRefreshToken] = useState<DecodedRefreshToken | undefined>();

  const getLoginUrl = () => {
    if (typeof window === "undefined") return;
    const { state, codeVerifier, codeChallenge } = createOAuthSecurity();
    const redirectQuery = {
      client_id: alexaClient.id,
      redirect_uri: alexaClient.redirectUris[0],
      response_type: "code",
      scope: [playNFTMusicScope.name],
      state,
      // code_challenge: codeChallenge,
      // code_challenge_method: "S256",
    };
    const oauth = {
      codeVerifier,
      state,
    };
    setCookie(undefined, COOKIE.auth, JSON.stringify(oauth), {
      path: "/"
    });
    return "/api/oauth/authorize" + "?" + querystring.stringify(redirectQuery);
  };

  const handleLogout = async () => {
    destroyCookie(undefined, COOKIE.auth);
    destroyCookie(undefined, COOKIE.accessToken);
    destroyCookie(undefined, COOKIE.refreshToken);
    setAccessToken(undefined);
    setRefreshToken(undefined);
    // await client("/logout", { method: "POST" });
    await router.replace("/");
  };

  const handleCodeTokenExchange = async (code: string, incomingState: string): Promise<boolean> => {
    const foo = parseCookies(undefined)[COOKIE.auth];
    let oauth: any;
    try {
      oauth = JSON.parse(foo);
    } catch (e) {
      console.log({ foo });
      console.log(e);
    }

    const codeVerifier = oauth?.codeVerifier;
    const existingState = oauth?.state;

    if (!codeVerifier) {
      console.error("NO CODE VERIFIER");
      return false;
    }

    if (incomingState !== existingState) {
      console.error(`INVALID STATE ${incomingState} ${existingState}`);
      return false;
    }

    const body: any = {
      code,
      state: existingState,
      code_verifier: codeVerifier,
      client_id: alexaClient.id,
      redirect_uri: alexaClient.redirectUris[0],
      grant_type: "authorization_code",
    };

    const url = "/api/oauth/token";

    const response = await fetch(url, {
      body: JSON.stringify(body),
      method: "POST",
      headers: { "content-type": "application/json" },
    }).then(res => res.json());

    if (response.message) {
      console.error(response.message);
      return false;
    }

    if (response.access_token) setAccessTokenCookie(response.access_token);
    if (response.refresh_token) setRefreshTokenCookie(response.refresh_token);

    destroyCookie(undefined, COOKIE.auth);
    return true;
  };

  const setAccessTokenCookie = (token: string) => {
    const decodedJWT: DecodedJWT | any = jwt_decode(token);
    const accessToken: DecodedAccessToken = {
      token,
      userId: decodedJWT.sub,
      expiresAt: decodedJWT.exp,
      email: decodedJWT.email,
      isActive: decodedJWT.isActive,
    };
    setCookie(undefined, COOKIE.accessToken, JSON.stringify(accessToken), {
      path: "/",
      expires: new Date(decodedJWT.exp * 1000),
    });
    setAccessToken(accessToken);
  };

  const setRefreshTokenCookie = (token: string) => {
    const decodedJWT: DecodedJWT | any = jwt_decode(token);
    const refreshToken: DecodedRefreshToken = {
      token,
      userId: decodedJWT.user_id,
      expiresAt: decodedJWT.expire_time,
    };
    setCookie(undefined, COOKIE.refreshToken, JSON.stringify(refreshToken), {
      path: "/",
      expires: new Date(decodedJWT.expire_time * 1000),
    });
    setRefreshToken(refreshToken);
  };

  const isAuthenticated = () => !(Date.now() / 1000 > (accessToken?.expiresAt ?? 0));

  return <AuthContext.Provider value={{
    accessToken,
    isAuthenticated,
    handleLogout,
    handleCodeTokenExchange,
    getLoginUrl,
  }} {...props} />;
}

type UseAuth = {
  accessToken?: DecodedAccessToken;
  isAuthenticated(): boolean;
  handleLogout(): Promise<void>;
  getLoginUrl(): string;
  handleCodeTokenExchange(code: string, incomingState: string): Promise<boolean>;
}

const useAuth = () => useContext<UseAuth>(AuthContext);

export { AuthProvider, useAuth };
