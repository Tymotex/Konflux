import styles from "./Timetable.module.scss";
import chroma from "chroma-js";
import { EventContext } from "contexts/event-context";
import React, { useContext, useMemo } from "react";
import TimetableGrid from "./TimetableGrid";

/** Holds an array of contiguous dates. */
export type TimeInterval = string[];

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
    const { eventState, eventDispatch } = useContext(EventContext);

    // An array of string hex codes with a length equal to the number of members
    // in this event.
    // TODO: is it best to put this here and not in TimetableGrid?
    const colourScale = useMemo(() => {
        return (
            chroma
                // TODO: parameterise this to make sure it matches the timeblock colours.
                .scale(["whitesmoke", "blue"])
                .colors(Object.keys(eventState.members).length + 1)
        );
    }, [eventState.members]);

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
