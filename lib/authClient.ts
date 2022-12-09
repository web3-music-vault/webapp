
import { getCsrfToken, signIn } from "next-auth/react"


export async function getNonce(walletId:string, ){
    const response = await fetch('/api/signup', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({
            walletId
        })
    })
    const json = await response.json()
    return json.nonce

}


export async function login(walletId: string, nonce: string, signature:string){

    let formData = new FormData();

    // const csrfToken = await getCsrfToken()
    // console.log('csrf token', csrfToken)
    // formData.append('csrfToken', csrfToken as string)

    formData.append('walletId', walletId);
    formData.append('signature', signature);
    formData.append('nonce', nonce);

    try{
        const signInResults =  await signIn("credentials", {
            // message: JSON.stringify({
            //     walletId,
            //     signature,
            //     nonce
            // }),
            redirect: false,
            signature,
            walletId,
            nonce,
            callbackUrl:'/'
          })

        console.log('signInResults', signInResults)
    }catch(e){
        console.error(e)
    }


    try{
        const response = await fetch('/api/auth/callback/credentials', {
            method: 'POST', 
            credentials: 'include',
            body: formData
        })
        console.log(response.headers)
        const json = await response.json()
        return json
    }catch(e){
        console.error(e)
    }

}


