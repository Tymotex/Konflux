import React from "react";
import EventCard from "./EventCard";
import styles from "./EventList.module.scss";

interface Props {}

const EventList: React.FC<Props> = () => {
    return (
        <ul className={styles.eventCardList}>
            <EventCard eventId="asdf" />
        </ul>
    );
};

export default EventList;
