import { Button } from "components/button";
import { KonfluxEvent } from "models/event";
import { useRouter } from "next/router";
import React from "react";
import EventCard from "./EventCard";
import styles from "./EventList.module.scss";

interface Props {
    events: KonfluxEvent[];
}

const EventList: React.FC<Props> = ({ events }) => {
    const router = useRouter();

    return events && events.length > 0 ? (
        <ul className={styles.eventCardList}>
            {events.map((event, i) => (
                <EventCard event={event} key={event.id || String(i)} />
            ))}
        </ul>
    ) : (
        <div className={styles.emptyEventList}>
            <p className={styles.description}>
                You don&apos;t have any events.
            </p>
            <Button onClick={() => router.push("/")}>Plan one</Button>
        </div>
    );
};

export default EventList;
