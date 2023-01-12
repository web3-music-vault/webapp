
import { useEffect, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export function Captcha({ onHumanDetected }: { onHumanDetected: (verified: boolean) => void }): JSX.Element {

    // captcha help
    const [token, setToken] = useState('');
    const captchaRef = useRef(null);

    const onLoad = () => {
        // this reaches out to the hCaptcha JS API and runs the
        // execute function on it. you can use other functions as
        // documented here:
        // https://docs.hcaptcha.com/configuration#jsapi
        (captchaRef.current as any)?.execute();
    };

    useEffect(() => {
        if (token){
            console.log(`hCaptcha Token: ${token}`);

            fetch('/api/captcha', {
                method: "POST",
                credentials: 'same-origin',
                body: JSON.stringify({
                    token,
                })
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('captcha validated', data)
                    if(data.verification){
                        onHumanDetected(true)
                    }
                    // setImageData(data)
                });
        }
       

        // const verified = await doIt(() => {
        //     return true;
        // })
        // TODO add verification from server


    }, [token, onHumanDetected]);


    return <HCaptcha
        sitekey={(process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY as string)}
        onLoad={onLoad}
        onVerify={setToken}
        ref={captchaRef}
    />


}