import EventList from "components/event/EventList";
import LocalStorageEventList from "components/event/LocalStorageEventList";
import { PageTransition } from "components/page-transition";
import { KonfluxEvent } from "models/event";
import { getGlobalUserEvents } from "models/global-user";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useGlobalUser } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";
import styles from "./events.module.scss";

const EventsHome: NextPage = () => {
    const globalUser = useGlobalUser();
    const [events, setEvents] = useState<KonfluxEvent[]>([]);

    useEffect(() => {
        if (globalUser) {
            getGlobalUserEvents(globalUser.id)
                .then((events) => setEvents(events))
                .catch((err) => spawnNotification("error", err.message));
        }
    }, [globalUser]);

    return (
        <>
            <Head>
                <title>Events</title>
            </Head>
            <PageTransition>
                <h1 className={styles.heading}>Your Events.</h1>
                {globalUser ? (
                    <EventList events={events} />
                ) : (
                    <></>
                    // <LocalStorageEventList />
                )}
            </PageTransition>
        </>
    );
};

export default EventsHome;
