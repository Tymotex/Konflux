import chroma from "chroma-js";
import { EventContext } from "contexts/event-context";
import { useDarkMode } from "contexts/ThemeProvider";
import React, {
    MouseEvent,
    MutableRefObject,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import { getHeaderHeight, syncHorizontalScroll } from "utils/timetable";
import AvailabilityLegend from "./AvailabilityLegend";
import styles from "./Timetable.module.scss";
import TimetableGrid from "./TimetableGrid";

interface Props {
    username: string;
    eventId: string;
}

const GroupAvailabilityTimetable: React.FC<Props> = ({ username, eventId }) => {
    const { eventState } = useContext(EventContext);
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
            if (
                !(
                    timeBlockIndex + eventState.earliest in
                    eventState.groupAvailabilities[date]
                )
            )
                return "";

            const numAvailable = Object.keys(
                eventState.groupAvailabilities[date][
                    timeBlockIndex + eventState.earliest
                ],
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

    const showSpecificNumAvailable = useCallback(
        (event: MouseEvent, numAvailable: number, state?: boolean) => {
            setAvailabilitiesToShow(
                (oldAvailabilitiesToShow: Set<number>): Set<number> => {
                    // Apply the `pressed` class to this element.
                    const thisElem = event.target as HTMLUListElement;
                    const newAvailabilityNumsToShow = new Set(
                        oldAvailabilitiesToShow,
                    );

                    // When a state is explicitly provided, set the state instead of
                    // toggling.
                    if (state !== undefined) {
                        if (state) newAvailabilityNumsToShow.add(numAvailable);
                        else newAvailabilityNumsToShow.delete(numAvailable);
                    } else {
                        // Toggle.
                        if (newAvailabilityNumsToShow.has(numAvailable))
                            newAvailabilityNumsToShow.delete(numAvailable);
                        else newAvailabilityNumsToShow.add(numAvailable);
                    }
                    return newAvailabilityNumsToShow;
                },
            );
        },
        [setAvailabilitiesToShow],
    );

    // Synchronise the height of this timetable's header with the other
    // timetable's header.
    useLayoutEffect(() => {
        const elem = document.getElementById("group-timetable-header");
        if (!elem) return;
        elem.style.height = getHeaderHeight();
    }, []);

    const syncScroll = useCallback(() => {
        const thisTimetable = document.querySelector("#group-timetable");
        const otherTimetable = document.querySelector("#individual-timetable");
        if (!thisTimetable)
            throw new Error("Individual timetable couldn't be queried.");
        if (!otherTimetable)
            throw new Error("Group timetable couldn't be queried.");
        syncHorizontalScroll(thisTimetable, otherTimetable);
    }, []);

    return (
        <div className={styles.container}>
            <div
                id="group-timetable-header"
                className={`${styles.header} ${styles.timetableHeader}`}
            >
                <h2>The group&apos;s availabilities.</h2>
                <p>
                    These are the current availabilities filled by other
                    attendees.
                </p>
                <AvailabilityLegend
                    colourScale={colourScale}
                    showFilter={showSpecificNumAvailable}
                />
            </div>
            <TimetableGrid
                username={username}
                eventId={eventId}
                showGroupAvailability
                getTimeBlockColour={getTimeBlockColour}
                gridClassName="group"
                startRow={eventState.earliest}
                endRow={eventState.latest}
                maxRows={48}
                id="group-timetable"
                onScroll={syncScroll}
            />
        </div>
    );
};

export default GroupAvailabilityTimetable;
