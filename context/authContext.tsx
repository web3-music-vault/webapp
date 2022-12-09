import { useWallet } from "@solana/wallet-adapter-react";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { getNonce, login } from "../lib/authClient";

type authContextType = {
    userId: string|null
    nonce: string|null
    signature: string|null
    loadingAuth: boolean
    token: string|null
    // setWalletId: (walletId:string) => void
    setNonceId: (nonce:string) => void
    setUserId: (userI:string) => void
    setSignature: (signature:string) => void,
    logout: () => void
};

const authContextDefaultValues: authContextType = {
    userId: null,
    nonce: null,
    signature: null,
    loadingAuth: false,
    token: null,
    // setWalletId: (walletId:string) => {},
    setNonceId: (nonce:string) => {},
    setUserId: (userId:string) => {},
    setSignature: (signature:string) => {},

    // login: (login:{walletId?:string, userId?:string, nonce?:string}) => {},
    // login: () => {},
    logout: () => {},
};

const AuthContext = createContext<authContextType>(authContextDefaultValues);

export function useAuth() {
    return useContext(AuthContext);
}

type Props = {
    children: ReactNode;
};

export function AuthProvider({ children }: Props) {
    const [userId, setUserId] = useState<string|null>(null);
    const [nonce, setNonceId] = useState<string|null>(null);
    const [signature, setSignature] = useState<string|null>(null);
    const [loadingAuth, setLoading] = useState(false)
    const [token, setToken] = useState<string|null>(null);

    const { publicKey } = useWallet();


    useEffect(() => {
        // return () => {
            // console.log('currentPage update', currentPage)
          if(publicKey && signature &&  nonce){

            const loginToWallet =  async() => {
                try{
                    const userInfo = await login(publicKey?.toString(),nonce, signature)
                    console.log(userInfo)
                    setNonceId(userInfo.nonce)
                    setToken(userInfo.token)
                }catch(e){
                    console.error(e)
                }
            
                // console.log('newNonce', newNonce)
                // setNonceId(newNonce)
            }
           
            loginToWallet()
            
          }
        // }
        return () => {
            // console.log('This will be logged on unmount');
          };
    }, [signature]);
  
    // watch when public key changes .. need to login and get current nonce
    useEffect(() => {
        // return () => {
            // console.log('currentPage update', currentPage)
          if(publicKey){

            const setupNonce =  async(walletId:string) => {
                const newNonce = await getNonce(walletId)
                console.log('newNonce', newNonce)
                setNonceId(newNonce)
            }
            
           setupNonce(publicKey.toString())
          }
        // }
        return () => {
            // console.log('This will be logged on unmount');
          };
    }, [publicKey]);

    const logout = () => {
       setUserId(authContextDefaultValues.userId)
       setNonceId(authContextDefaultValues.nonce)
       setSignature(authContextDefaultValues.signature)
       setToken(authContextDefaultValues.token)
    };

    const value = {
        userId,
        nonce,
        signature,
        loadingAuth,
        token,
        setNonceId,
        setUserId,
        setSignature,
        logout,
    };

    // useEffect(() => {
    //     if(signature){
    //         console.log('new signature', signature)
    //     }
    //     return () => {
    //         // console.log('This will be logged on unmount');
    //       };
    // }, [signature]);

    return (
        <>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    );
}