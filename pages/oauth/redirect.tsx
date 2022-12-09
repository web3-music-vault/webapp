import { useEffect, useState } from "react";

import { AuthProvider, DecodedAccessToken, useAuth} from "../../lib/use_auth";

export default function Oauth() {
  const { getLoginUrl, accessToken } = useAuth();
  const [loginUrl, setLoginUrl] = useState<string>();
  const [token, setToken] = useState<DecodedAccessToken>();

  useEffect(() => {
    setLoginUrl(getLoginUrl());
    setToken(accessToken)
  }, [accessToken, getLoginUrl]);

  return <AuthProvider>
    <div>
      <p>AccessToken: {JSON.stringify(token)}</p>
      <a href={loginUrl} style={{ backgroundColor: "lightblue", padding: 5, borderRadius: "5px" }}>Redirect to Login</a>
    </div>
  </AuthProvider>;
}


Oauth.provider = AuthProvider