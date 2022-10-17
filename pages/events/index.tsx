import EventList from "components/event/EventList";
import { PageTransition } from "components/page-transition";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "./events.module.scss";

const EventsHome: NextPage = () => {
    return (
        <>
            <Head>
                <title>Events</title>
            </Head>
            <PageTransition>
                <h1 className={styles.heading}>Your Events.</h1>
                <EventList />
            </PageTransition>
        </>
    );
};

export default EventsHome;
