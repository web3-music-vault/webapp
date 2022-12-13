import { AuthorizationServer, DateInterval, JwtService } from "@jmondi/oauth2-server";

import {
  dbAccessTokenRepository,
  inMemoryAuthCodeRepository,
  inMemoryClientRepository,
  inMemoryScopeRepository,
  inMemoryUserRepository,
} from "./repository";

const clientRepository = inMemoryClientRepository;
const authCodeRepository = inMemoryAuthCodeRepository;
const tokenRepository = dbAccessTokenRepository;
const scopeRepository = inMemoryScopeRepository;
const userRepository = inMemoryUserRepository;

const jwtService = new JwtService("secret secret secret");

const authorizationServer = new AuthorizationServer(
  authCodeRepository,
  clientRepository,
  tokenRepository,
  scopeRepository,
  userRepository,
  jwtService
);
authorizationServer.setOptions({
  notBeforeLeeway: 0,
  requiresPKCE:false, // possible cause of Alexa auth not finishing
  requiresS256:false,
  tokenCID: "name"
})


authorizationServer.enableGrantType("authorization_code", new DateInterval("15m"));
authorizationServer.enableGrantType("client_credentials", new DateInterval("15m"));
authorizationServer.enableGrantType("refresh_token", new DateInterval("15m"));

export { authorizationServer as inMemoryAuthorizationServer };

export enum SERVER_COOKIES {
  user = "authorization_server__user",
  authorized = "authorization_server__is_authorized",
}
