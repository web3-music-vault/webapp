import { useRouter } from "next/router";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "../../lib/use_auth";

export default function Callback() {
  const router = useRouter();
  const { code, state } = router.query;
  const { handleCodeTokenExchange } = useAuth();

  useEffect(() => {
    if (typeof code !== "string" || typeof state !== "string") return;

    handleCodeTokenExchange(code, state).then(success => {
      if (success) router.push("/");
    });
  }, [code, handleCodeTokenExchange, router, state]);

  return <div>Saving OAuth Credentials</div>;
}


Callback.provider = AuthProvider