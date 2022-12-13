import { useDarkMode } from "hooks/theme";
import React, { MouseEvent, useCallback, useState } from "react";
import { spawnNotification } from "utils/notifications";
import styles from "./AvailabilityLegend.module.scss";
import PinIcon from "assets/icons/pin.svg";

interface Props {
    colour: string;
    numAvailable: number;
    totalAvailable: number;
    showFilter: (
        event: MouseEvent,
        numAvailable: number,
        state?: boolean,
    ) => void;
}

const AvailabilityItem: React.FC<Props> = ({
    colour,
    numAvailable,
    totalAvailable,
    showFilter,
}) => {
    const [pinned, setPinned] = useState<boolean>(false);
    const isDarkMode = useDarkMode();

    const pin = useCallback(
        (e: MouseEvent) => {
            if (!pinned) {
                showFilter(e, numAvailable, true);
                setPinned(true);
            } else {
                setPinned(false);
            }
        },
        [numAvailable, pinned, setPinned, showFilter],
    );

    const show = (e: MouseEvent) => {
        showFilter(e, numAvailable, true);
    };

    const hide = useCallback(
        (e: MouseEvent) => {
            if (pinned) {
                showFilter(e, numAvailable, true);
            } else {
                showFilter(e, numAvailable, false);
            }
        },
        [pinned, showFilter, numAvailable],
    );

    return (
        <li
            key={colour}
            className={styles.availabilityChip}
            onClick={pin}
            onMouseEnter={show}
            onMouseLeave={hide}
            style={{
                pointerEvents: numAvailable === 0 ? "none" : "auto",
            }}
        >
            <div
                style={{
                    backgroundColor: colour,
                    transform: pinned ? "scale(1.1)" : "",
                    border: pinned
                        ? `3px solid ${isDarkMode ? "white" : "darkslategrey"}`
                        : "",
                    boxShadow: pinned
                        ? "rgba(20, 20, 120, 0.4) 0px 3px 8px"
                        : "",
                }}
                className={styles.colour}
            >
                {/* {pinned && <PinIcon className={styles.pinIcon} />} */}
            </div>
            <div className={styles.label}>
                <strong>{numAvailable}</strong>
                {`/${totalAvailable}`}
            </div>
        </li>
    );
};

export default AvailabilityItem;
