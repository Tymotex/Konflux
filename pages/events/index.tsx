import { PageTransition } from "components/page-transition";
import type { NextPage } from "next";
import Head from "next/head";

const EventsHome: NextPage = () => {
    return (
        <>
            <Head>
                <title>Events</title>
            </Head>
            <PageTransition>
                <h1>Events</h1>
            </PageTransition>
        </>
    );
};

export default EventsHome;
