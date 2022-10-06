import { PageTransition } from "components/page-transition";
import type { NextPage } from "next";
import Head from "next/head";

const PrivacyPolicy: NextPage = () => {
    return (
        <>
            <Head>
                <title>Privacy Policy</title>
            </Head>
            <PageTransition>
                <h2>Privacy Policy</h2>
            </PageTransition>
        </>
    );
};

export default PrivacyPolicy;
