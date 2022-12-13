import { PageTransition } from "components/page-transition";
import type { NextPage } from "next";
import Head from "next/head";

const ContactPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Contact</title>
            </Head>
            <PageTransition>
                <h2>Contact</h2>
            </PageTransition>
        </>
    );
};

export default ContactPage;
