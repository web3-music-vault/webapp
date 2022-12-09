import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import * as querystring from "querystring";
import { AuthProvider } from "../../lib/use_auth";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useSession, signIn, signOut } from "next-auth/react"
import styles from "../../styles/Login.module.css";
import { NextPage } from "next";
import { useAuth } from "../../context/authContext";

const WalletDisconnectButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
  { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const SignButtonDynamic = dynamic(
  async () => (await import('../../components/SignMessageOauth')).SignMessageOauth,
  { ssr: false }
);

const LoginOAUTH: NextPage = () => {
  const { query } = useRouter();
  const { publicKey } = useWallet();
  const { data: session } = useSession()
  const { nonce } = useAuth()
  console.log('publicKey', publicKey)

  console.log('session', session)

  const qs = useMemo(() => querystring.stringify(query), [query]);

  const logout = () => {
    signOut()
  }

  useEffect(() => {

    function submitForm() {
      const path = "/api/oauth/login?" + qs
      const method = "post";

      var form = document.createElement("form");
      form.setAttribute("method", method);
      form.setAttribute("action", path);

      //Move the submit function to another variable
      //so that it doesn't get overwritten.
      form._submit_function_ = form.submit;

      document.body.appendChild(form);
      form._submit_function_();
    }


    if (session && publicKey && publicKey.toString()) {
      submitForm()
    }


  }, [publicKey, session, qs])



  return (
    <div className={styles.container}>


      <main className={styles.main}>
        <h1 className={styles.title}>
          Web3 Music Vault
        </h1>

        <div className={styles.walletButtons}>
          {session && publicKey && publicKey.toString() ? <WalletDisconnectButtonDynamic onClick={logout} /> :
            (publicKey && publicKey.toString()) ? <SignButtonDynamic /> : <WalletMultiButtonDynamic />}

        </div>

        {/* {session && publicKey && publicKey.toString() ? <NFTImageList userId={(session?.user as any).id} walletId={publicKey.toString()}/> : <></>} */}


        {/* <form action={"/api/oauth/login?" + qs} method="POST">
                <button>Auth</button>
                </form> */}


        {/* {session ? (
                    <>
                        Signed in as {session?.user?.name} <br />
                        <button onClick={() => signOut()}>Sign out</button>
                    </>
                ):
                (
                    <>
                    Not signed in <br />
                    <button onClick={() => signIn()}>Sign in</button>
                    </>
                )} */}




      </main>

      {/* <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
                        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
                    </span>
                </a>
            </footer> */}
    </div>
  );
  // {/* <form action={"/api/oauth/login?" + qs} method="POST">
  //   <label>
  //     Email
  //     <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
  //   </label>
  //   <label>
  //     Password
  //     <input type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>
  //   </label>
  //   <button type="submit">Submit</button>
  // </form> */}
  // </div>
}

export default LoginOAUTH;