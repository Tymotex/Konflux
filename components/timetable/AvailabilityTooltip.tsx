import { EventContext } from "contexts/event-context";
import { useDarkMode } from "hooks/theme";
import React, { useContext, useMemo } from "react";
import ReactTooltip from "react-tooltip";
import { getDisplayTime } from "utils/timetable";
import styles from "./AvailabilityTooltip.module.scss";
import CheckIcon from "assets/icons/check.svg";
import CrossIcon from "assets/icons/close.svg";

interface Props {
    peopleAvailable: Set<string>;
    timeIndex: number;
}

const AvailabilityTooltip: React.FC<Props> = ({
    peopleAvailable,
    timeIndex,
}) => {
    const isDarkMode = useDarkMode();
    const { eventState } = useContext(EventContext);

    const whoIsntAvailable = useMemo(() => {
        if (!peopleAvailable) return new Set<string>();
        return new Set<string>(
            Object.keys(eventState.members || {}).filter(
                (person) => !peopleAvailable.has(person),
            ),
        );
    }, [peopleAvailable, eventState]);

    return (
        <ReactTooltip
            id="timetable-tooltip"
            effect="solid"
            type={isDarkMode ? "light" : "dark"}
        >
            <div
                className={`${styles.tooltipContainer} ${
                    isDarkMode ? styles.dark : ""
                }`}
            >
                <h3>Available from {getDisplayTime(eventState, timeIndex)}</h3>
                {peopleAvailable && peopleAvailable.size > 0 ? (
                    <ul className={styles.peopleList}>
                        {Array.from(peopleAvailable).map((person) => (
                            <li key={person} className={styles.item}>
                                <CheckIcon className={styles.icon} />
                                {person}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>No one 😥</>
                )}
                <h3>Unavailable</h3>
                {eventState && whoIsntAvailable && whoIsntAvailable.size > 0 ? (
                    <ul className={styles.peopleList}>
                        {Array.from(whoIsntAvailable).map((person) => (
                            <li key={person} className={styles.item}>
                                <CrossIcon className={styles.icon} />
                                {person}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>No one 🥳</>
                )}
            </div>
        </ReactTooltip>
    );
};

export default AvailabilityTooltip;
