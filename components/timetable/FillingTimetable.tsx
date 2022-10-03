import React from "react";
import { syncHeaderHeight } from "utils/timetable";
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
    return (
        <div>
            <div
                id="individual-timetable"
                className={`${styles.header} ${styles.timetableHeader}`}
                style={{ height: syncHeaderHeight() }}
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
            />
        </div>
    );
};

export default FillingTimetable;
