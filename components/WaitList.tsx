import { useEffect, useRef, useState } from "react";
import styles from './WaitList.module.css';

export function WaitList({ walletId, userId }: { walletId: string; userId: string; }) {

    const [email, setEmail] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e: any) => {
        e.preventDefault();
        let response = await fetch("/api/waitlist", {
            method: "POST",
            body: JSON.stringify({email: email})
        })
        if (response.ok) {
            setHasSubmitted(true);
        } else {
            const errorText = await response.text()
            // @ts-ignore
            setError(errorText)
        }
    }

    // If the user successfully submitted their email,
    //   display a thank you message
    if (hasSubmitted) {
        return <div className={styles.formWrapper}>
            <span className={styles.subtitle}>
                Thanks for signing up! We will be in touch soon.
            </span>
        </div>
    }

    // Otherwise, display the form
    return <form className={styles.formWrapper} onSubmit={submit}>
        <input type="email" required placeholder="Email"
            className={[styles.formInput, styles.formTextInput].join(" ")}
            value={email} onChange={e => setEmail(e.target.value)} />

        <button type="submit" className={[styles.formInput, styles.formSubmitButton].join(" ")}>
            Join Waitlist
        </button>

        {error ? <div className={styles.error}>{error}</div> : null}
    </form>
}