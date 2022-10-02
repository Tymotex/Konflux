import chroma from "chroma-js";
import { EventContext } from "contexts/event-context";
import { useDarkMode } from "contexts/ThemeProvider";
import React, { useCallback, useContext, useMemo, useState } from "react";
import AvailabilityLegend from "./AvailabilityLegend";
import styles from "./Timetable.module.scss";
import TimetableGrid from "./TimetableGrid";

interface Props {
    username: string;
    eventId: string;
}

const GroupAvailabilityTimetable: React.FC<Props> = ({ username, eventId }) => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const isDarkMode = useDarkMode();

    // A set of the x/y availabilities to be shown. If the set consists of the
    // number 2, then all availabilities with 2 people will be shown.
    // If the set is empty, all availabilities should be shown.
    // TODO: using a set doesn't really make sense... perhaps just use one number only.
    const [availabilitiesToShow, setAvailabilitiesToShow] = useState<
        Set<number>
    >(new Set<number>());

    // An array of string hex codes with a length equal to the number of members
    // in this event.
    const colourScale = useMemo(() => {
        return chroma
            .scale([
                isDarkMode ? styles.defaultColourDark : styles.defaultColour,
                styles.selectedColour,
            ])
            .colors(Object.keys(eventState.members).length + 1);
    }, [eventState.members, isDarkMode]);

    /**
     * Gets the colour that should be assigned to the time block.
     * If we're filtering for specific availabilities, then this function might
     * return the empty string "", indicating that this time block should not
     * be coloured.
     */
    const getTimeBlockColour = useCallback(
        (date: string, timeBlockIndex: number): string => {
            if (!colourScale) return "";
            if (!(date in eventState.groupAvailabilities)) return "";
            if (!(timeBlockIndex in eventState.groupAvailabilities[date]))
                return "";

            const numAvailable = Object.keys(
                eventState.groupAvailabilities[date][timeBlockIndex],
            ).length;
            if (
                availabilitiesToShow.size === 0 ||
                availabilitiesToShow.has(numAvailable)
            )
                return colourScale[numAvailable];
            else return "";
        },
        [eventState, colourScale, availabilitiesToShow],
    );

    return (
        <div>
            <div className={styles.header}>
                <h2>The group&apos;s availabilities.</h2>
                <p>
                    These are the current availabilities filled by other
                    attendees.
                </p>
            </div>
            <TimetableGrid
                username={username}
                eventId={eventId}
                showGroupAvailability
                getTimeBlockColour={getTimeBlockColour}
            />
            <AvailabilityLegend
                colourScale={colourScale}
                onItemClick={(e, i) => {
                    // Apply the `pressed` class to this element.
                    const thisElem = e.target as HTMLUListElement;
                    const newAvailabilityNumsToShow = new Set(
                        availabilitiesToShow,
                    );
                    if (thisElem.classList.contains(styles.pressed)) {
                        thisElem.classList.remove(styles.pressed);
                        newAvailabilityNumsToShow.delete(i);
                    } else {
                        thisElem.classList.add(styles.pressed);
                        newAvailabilityNumsToShow.add(i);
                    }
                    setAvailabilitiesToShow(newAvailabilityNumsToShow);
                }}
            />
        </div>
    );
};

export default GroupAvailabilityTimetable;
