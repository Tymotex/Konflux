import { Callout } from "components/callout";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { getEventsFromLocalStorage } from "utils/local-events-list";
import WarningIcon from "assets/icons/warning.svg";
import { ModalControlContext } from "contexts/modal-control-context";
import styles from "./LocalStorageEventList.module.scss";
import IconButton from "components/button/IconButton";
import CopyLinkIcon from "assets/icons/link.svg";
import OpenInNewTabIcon from "assets/icons/open-in-new.svg";
import DeleteIcon from "assets/icons/delete.svg";
import Link from "next/link";
import { BASE_URL } from "constants/url";
import { useCopyTextToClipboard } from "hooks/clipboard";
import LocalStorageEventCard from "./LocalStorageEventCard";
import { EventDataProvider } from "contexts/EventDataProvider";
import { useLocalStorageEvents } from "hooks/local-event";
import { Button } from "components/button";
import { useRouter } from "next/router";

interface Props {}

const LocalStorageEventList: React.FC<Props> = () => {
    const { openModal } = useContext(ModalControlContext);
    const events = useLocalStorageEvents();
    const router = useRouter();

    return (
        <>
            {events && events.length > 0 ? (
                <>
                    <Callout Icon={WarningIcon}>
                        These events are only saved here for your current
                        device.{" "}
                        <strong>
                            <a onClick={() => openModal("login")}>Sign in</a>
                        </strong>{" "}
                        or{" "}
                        <strong>
                            <a onClick={() => openModal("register")}>
                                create an account
                            </a>
                        </strong>{" "}
                        to see your events across all your devices and in
                        greater detail.
                    </Callout>
                    <ul className={styles.list}>
                        {events.map((event) => (
                            <LocalStorageEventCard event={event} />
                        ))}
                    </ul>
                </>
            ) : (
                <div className={styles.emptyEventList}>
                    <p className={styles.description}>
                        You have no events yet.
                    </p>
                    <Button onClick={() => router.push("/")}>Plan One</Button>
                </div>
            )}
        </>
    );
};

export default LocalStorageEventList;
