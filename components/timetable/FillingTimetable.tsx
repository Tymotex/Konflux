import DualRangeSlider from "components/form/DualRangeSlider";
import { EventContext } from "contexts/event-context";
import { useBreakpointTrigger } from "hooks/window";
import React, { useCallback, useContext, useLayoutEffect, useRef } from "react";
import styleVariables from "styles/breakpoints.module.scss";
import { getHeaderHeight, syncHorizontalScroll } from "utils/timetable";
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
    const { eventState, eventDispatch } = useContext(EventContext);
    const widthLessThanXs = useBreakpointTrigger(parseInt(styleVariables.xs));

    // Synchronise the height of this timetable's header with the other
    // timetable's header.
    useLayoutEffect(() => {
        if (!widthLessThanXs) {
            const elem = document.getElementById("individual-timetable-header");
            if (!elem) return;
            elem.style.height = getHeaderHeight();
        }
    }, [widthLessThanXs]);

    const handleTimeRangeChange = useCallback(
        (minVal: number, maxVal: number) => {
            // setEarliestTimeIndex(minVal);
            // setLatestTimeIndex(maxVal);
            eventDispatch({
                type: "SET_TIME_RANGE",
                payload: {
                    eventId: eventId,
                    earliestTimeIndex: minVal,
                    latestTimeIndex: maxVal,
                },
            });
        },
        [eventDispatch, eventId],
    );

    const syncScroll = useCallback(() => {
        const thisTimetable = document.querySelector("#individual-timetable");
        const otherTimetable = document.querySelector("#group-timetable");
        if (!thisTimetable)
            throw new Error("Individual timetable couldn't be queried.");
        if (!otherTimetable)
            throw new Error("Group timetable couldn't be queried.");
        syncHorizontalScroll(thisTimetable, otherTimetable);
    }, []);

    return (
        <div className={styles.container}>
            <div
                id="individual-timetable-header"
                className={`${styles.header} ${styles.timetableHeader}`}
            >
                <h2>Your availabilities.</h2>
                <p style={{ marginBottom: "40px" }}>
                    Fill in your availabilities by clicking and dragging the
                    time slots below.
                </p>
                <DualRangeSlider
                    defaultMinVal={eventState.earliest}
                    defaultMaxVal={eventState.latest}
                    totalVals={48}
                    onChange={handleTimeRangeChange}
                />
            </div>
            <TimetableGrid
                username={username}
                eventId={eventId}
                disabled={!username && !showGroupAvailability}
                showGroupAvailability={showGroupAvailability}
                gridClassName="individual"
                startRow={eventState.earliest}
                endRow={eventState.latest}
                maxRows={48}
                id="individual-timetable"
                onScroll={syncScroll}
            />
        </div>
    );
};

export default FillingTimetable;
