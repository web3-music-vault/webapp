import { NextPage } from "next"
import Head from "next/head";
import Link from "next/link";
import Branding from "../components/Branding";
import styles from '../styles/Home.module.css';

const Privacy: NextPage = () => {

    return (<>

        <Head>
            <title>Web3 Music Vault</title>
            <meta name="description" content="Web3 Music Vault a way to connect Un-lockable NFT music with Alexa" />
            <Branding />
        </Head>
        <div className={styles.container}>

            <main className={styles.main}>


                <h1 className={styles.title}>
                    Web3 Music Vault
                </h1>
                <h2>Privacy Policy</h2>
                <p>
                    At Prizem Labs, we take your privacy seriously and are committed to protecting your personal information. This privacy policy outlines the information we collect and how we use it in our web application.
                </p>
                <p>
                    We collect the following information from users who access our web application:
                </p>


                <ul>
                    <li>Wallet information such as wallet ID</li>
                    <li>Information about your use of our web application, including pages visited and actions taken</li>
                    <li>Any information you voluntarily provide through forms or other interactions within the web application</li>
                    <li>We use this information to provide you with the best possible experience on our web application. This includes customizing content and advertising to better suit your interests, as well as analyzing user behavior to improve the functionality of our web application.</li>
                </ul>

                <p>
                    We do not sell or share your personal information with any third parties without your consent, except in the following situations:

                </p>
                <ul>
                    <li>If required by law or in response to a valid legal request</li>
                    <li>To protect the safety and security of our users or the general public</li>
                    <li>We take appropriate measures to protect your personal information and will only retain it for as long as necessary to fulfill the purposes outlined in this privacy policy. You have the right to access, rectify, or delete your personal information at any time.</li>


                </ul>

                <p>
                    Please contact us if you have any questions or concerns about our privacy policy or the use of your personal information. We are committed to maintaining your trust and will continue to review and update our privacy policy as needed.
                </p>

            </main>

            <footer className={styles.footer}>
                <Link href="/">Vault</Link>
                <Link href="/privacy">Privacy Policy</Link>
            </footer>

        </div>
    </>)



}


export default Privacy