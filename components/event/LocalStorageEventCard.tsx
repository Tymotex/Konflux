import IconButton from "components/button/IconButton";
import { BASE_URL } from "constants/url";
import { useCopyTextToClipboard } from "hooks/clipboard";
import Link from "next/link";
import React, { useMemo } from "react";
import CopyLinkIcon from "assets/icons/link.svg";
import OpenInNewTabIcon from "assets/icons/open-in-new.svg";
import DeleteIcon from "assets/icons/delete.svg";
import styles from "./LocalStorageEventList.module.scss";
import { removeEventFromLocalStorage } from "utils/local-events-list";
import { useRouter } from "next/router";
import { LocalStorageEventData } from "hooks/local-event";

interface Props {
    event: LocalStorageEventData;
}

const LocalStorageEventCard: React.FC<Props> = ({ event }) => {
    const router = useRouter();

    const link = useMemo(() => {
        return `${BASE_URL}/events/${event.id}`;
    }, [event.id]);

    const copyToClipboard = useCopyTextToClipboard(link);

    return (
        <>
            <li key={event.id} className={styles.item}>
                <Link href={`${BASE_URL}/events/${event.id}`}>
                    <a className={styles.eventName}>{event.name}</a>
                </Link>
                <div className={styles.buttonGroup}>
                    <IconButton
                        Icon={OpenInNewTabIcon}
                        onClick={() => router.push(link)}
                    />
                    <IconButton
                        Icon={CopyLinkIcon}
                        onClick={() => copyToClipboard()}
                    />
                    <IconButton
                        Icon={DeleteIcon}
                        onClick={() => {
                            removeEventFromLocalStorage(event.id);
                            window.location.reload();
                        }}
                    />
                </div>
            </li>
        </>
    );
};

export default LocalStorageEventCard;
