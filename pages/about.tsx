import { PageTransition } from "components/page-transition";
import { TopNav } from "components/top-nav";
import type { NextPage } from "next";
import Head from "next/head";

const AboutPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>About</title>
            </Head>
            <PageTransition>
                <h2>About</h2>
            </PageTransition>
        </>
    );
};

export default AboutPage;
