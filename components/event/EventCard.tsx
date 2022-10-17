import { Button } from "components/button";
import { KonfluxEvent } from "models/event";
import Link from "next/link";
import React from "react";
import styles from "./EventList.module.scss";
import OpenInNewTabIcon from "assets/icons/open-in-new.svg";
import LinkIcon from "assets/icons/link.svg";
import EllipsisIcon from "assets/icons/ellipsis.svg";
import StarIcon from "assets/icons/star.svg";
import TimeIcon from "assets/icons/time.svg";
import { useDarkMode } from "hooks/theme";

interface Props {
    eventId: string;
    event: KonfluxEvent;
}

const EventCard: React.FC<Props> = ({ eventId, event }) => {
    const isDarkMode = useDarkMode();

    return (
        <li className={`${styles.card} ${isDarkMode ? styles.dark : ""}`}>
            <div className={styles.ellipsisMenu}>
                <EllipsisIcon className={styles.icon} />
            </div>
            <h2 className={styles.heading}>
                <Link href={`/events/${eventId}`}>
                    Dinner with Linus Torvalds
                </Link>
            </h2>
            <ul className={styles.propertiesList}>
                <li className={styles.item}>
                    <div className={styles.icon}>
                        <StarIcon />
                    </div>
                    You're an organiser.
                </li>
                <li className={styles.item}>
                    <div className={styles.icon}>
                        <TimeIcon />
                    </div>
                    Between 15th March and 29th March.
                </li>
            </ul>
            <div className={styles.buttonGroup}>
                <Button colour="secondary" Icon={OpenInNewTabIcon} size="sm">
                    View
                </Button>
                <Button colour="secondary" Icon={LinkIcon} size="sm">
                    Copy Link
                </Button>
            </div>
        </li>
    );
};

export default EventCard;
