import React from "react";
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
            <div className={styles.header}>
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
