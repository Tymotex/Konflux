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
        <div className={styles.timetable}>
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
