import { Menu, MenuButton, MenuList } from "@reach/menu-button";
import EllipsisIcon from "assets/icons/ellipsis.svg";
import LinkIcon from "assets/icons/link.svg";
import MemberIcon from "assets/icons/member.svg";
import OpenInNewTabIcon from "assets/icons/open-in-new.svg";
import StarIcon from "assets/icons/star.svg";
import TimeIcon from "assets/icons/time.svg";
import { Button } from "components/button";
import { BASE_URL } from "constants/url";
import { EventDataProvider } from "contexts/EventDataProvider";
import { useCopyTextToClipboard } from "hooks/clipboard";
import { useDetermineIsOwner, useDetermineMinMaxDates } from "hooks/event";
import { useDarkMode } from "hooks/theme";
import { KonfluxEvent } from "models/event";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useGlobalUser } from "utils/global-auth";
import styles from "./EventList.module.scss";
import LeaveEvent from "./LeaveEvent";

interface Props {
    event: KonfluxEvent;
}

const EventCard: React.FC<Props> = ({ event }) => {
    const router = useRouter();
    const isDarkMode = useDarkMode();

    const link = useMemo(() => {
        return `${BASE_URL}/events/${event.id}`;
    }, [event.id]);
    const copyToClipboard = useCopyTextToClipboard(link);

    const globalUser = useGlobalUser();

    const isOwner = useDetermineIsOwner(globalUser, event);
    const [earliestDate, latestDate] = useDetermineMinMaxDates(event);

    return (
        <li className={`${styles.card} ${isDarkMode ? styles.dark : ""}`}>
            <EventDataProvider event={event}>
                <Menu>
                    <MenuButton className={styles.ellipsisMenu}>
                        <EllipsisIcon className={styles.icon} />
                    </MenuButton>
                    <MenuList>
                        <LeaveEvent isMenuItem eventId={event.id} />
                    </MenuList>
                </Menu>
            </EventDataProvider>
            <h2 className={styles.heading}>
                <Link href={link}>{event.name}</Link>
            </h2>
            <ul className={styles.propertiesList}>
                <li className={styles.item}>
                    <div className={styles.icon}>
                        {isOwner ? <StarIcon /> : <MemberIcon />}
                    </div>
                    <span>
                        {isOwner ? "You're an organiser." : "You're a member."}
                    </span>
                </li>
                <li className={styles.item}>
                    <div className={styles.icon}>
                        <TimeIcon />
                    </div>
                    <span aria-label="Time span">
                        {earliestDate ? (
                            earliestDate !== latestDate ? (
                                <>
                                    Happening sometime between{" "}
                                    <strong>{earliestDate}</strong> and{" "}
                                    <strong>{latestDate}</strong>.
                                </>
                            ) : (
                                <>
                                    Happening sometime on{" "}
                                    <strong>{earliestDate}</strong>
                                </>
                            )
                        ) : (
                            <>No dates considered yet.</>
                        )}
                    </span>
                </li>
            </ul>
            <div className={styles.buttonGroup}>
                <Button
                    colour="secondary"
                    Icon={OpenInNewTabIcon}
                    size="sm"
                    onClick={() => router.push(link)}
                >
                    View
                </Button>
                <Button
                    colour="secondary"
                    Icon={LinkIcon}
                    size="sm"
                    onClick={() => copyToClipboard()}
                >
                    Copy Link
                </Button>
            </div>
        </li>
    );
};

export default EventCard;
