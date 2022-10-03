import React, { MutableRefObject, useEffect, useLayoutEffect } from "react";
import { getHeaderHeight } from "utils/timetable";
import styles from "./Timetable.module.scss";
import TimetableGrid from "./TimetableGrid";

interface Props {
    username: string;
    eventId: string;
    showGroupAvailability?: boolean;
}

const FillingTimetable: React.FC<Props> = ({
    showGroupAvailability = false,
    username,
    eventId,
}) => {
    // Synchronise the height of this timetable's header with the other
    // timetable's header.
    useLayoutEffect(() => {
        const elem = document.getElementById("individual-timetable");
        if (!elem) return;
        elem.style.height = getHeaderHeight();
    }, []);

    return (
        <div>
            <div
                id="individual-timetable"
                className={`${styles.header} ${styles.timetableHeader}`}
            >
                <h2>Your availabilities.</h2>
                <p>
                    Fill in your availabilities by clicking and dragging the
                    time slots below.
                </p>
            </div>
            <TimetableGrid
                username={username}
                eventId={eventId}
                disabled={!username && !showGroupAvailability}
                showGroupAvailability={showGroupAvailability}
                gridClassName="individual"
            />
        </div>
    );
};

export default FillingTimetable;
