/**
 * Verify the identity token 
 * https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
 * 
 * reference implementation
 * https://github.com/aws-samples/amazon-cognito-example-for-external-idp/blob/master/lambda/api/src/services/authorizationMiddleware.ts
 * 
 */
import { JwtRsaVerifier } from "aws-jwt-verify";


/**
 * Common claims for both id and access tokens
 */
export interface ClaimsBase {
  [name: string]: any;

  aud: string;
  iss: string;
  "cognito:groups"?: string[];
  exp: number;
  iat: number;
  sub: string;
  token_use: "id" | "access";
}

/**
 * Some id token specific claims
 */
export interface IdTokenClaims extends ClaimsBase {

  "cognito:username": string;
  email?: string;
  email_verified?: string;
  auth_time: string;
  token_use: "id";
}

/**
 * Some access token specific claims
 */
export interface AccessTokenClaims extends ClaimsBase {

  username?: string;
  token_use: "access";
}

/**
 * combined type for Claims
 */
export type Claims = IdTokenClaims | AccessTokenClaims;


/**
 * Parses the token and returns the claims
 * @param token a base64 encoded JWT token (id or access)
 * @return parsed Claims or null if no token was provided
 */
export function getClaimsFromToken(token?: string): Claims | null {
  if (!token) {
    return null;
  }
  try {
    const base64decoded = Buffer.from(token.split(".")[1], "base64").toString("ascii");
    return JSON.parse(base64decoded);
  } catch (e) {
    console.error("Invalid JWT token", e);
    // in case a malformed token was provided, we treat it as if non was provided, users will get a 401 in our case
    return null;
  }
}

async function loadJwk() {
  const response = await fetch("https://cognito-identity.us-west-2.amazonaws.com/.well-known/jwks_uri")
  const json = await response.json();
  console.log('json', json)

  return json
}


export async function verifySignature(token: string) {

  const verifier = JwtRsaVerifier.create({
    issuer: "https://cognito-identity.amazonaws.com", // set this to the expected "iss" claim on your JWTs
    audience: "us-west-2:c34713f1-f5e2-46a1-be42-dc10814345ab", // set this to the expected "aud" claim on your JWTs
    // jwksUri: "https://cognito-identity.us-west-2.amazonaws.com/.well-known/jwks_uri", // set this to the JWKS uri from your OpenID configuration
  });

  let result = false;
  try {
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", payload);
    result = true;
  } catch (e) {
    console.log("Token not valid!", e);
    result = false;
  }

  // var jwt = require('jsonwebtoken');
  // var jwkToPem = require('jwk-to-pem');
  // const jwk = await loadJwk()
  // var pem = jwkToPem(jwk);
  // const result = await jwt.verify(token, pem, { algorithms: ['RS512'] })
  // console.log('verifySignature', result)
  return result;
}



