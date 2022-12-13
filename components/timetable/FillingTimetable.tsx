import DualRangeSlider from "components/form/DualRangeSlider";
import { Status } from "components/sync-status/SyncStatus";
import { EventContext } from "contexts/event-context";
import { LocalAuthContext } from "contexts/local-auth-context";
import { useGlobalOrLocalEventMember } from "hooks/event";
import { useBreakpointTrigger } from "hooks/window";
import React, { useCallback, useContext, useLayoutEffect, useRef } from "react";
import styleVariables from "styles/breakpoints.module.scss";
import { getHeaderHeight, syncHorizontalScroll } from "utils/timetable";
import styles from "./Timetable.module.scss";
import TimetableGrid from "./TimetableGrid";

interface Props {
    eventId: string;
    showGroupAvailability?: boolean;
    updateStatus: (status: Status) => void;
}

const FillingTimetable: React.FC<Props> = ({
    showGroupAvailability = false,
    eventId,
    updateStatus,
}) => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const widthLessThanXs = useBreakpointTrigger(parseInt(styleVariables.xs));
    const { localAuthState } = useContext(LocalAuthContext);
    const eventMember = useGlobalOrLocalEventMember(localAuthState);

    // Synchronise the height of this timetable's header with the other
    // timetable's header.
    useLayoutEffect(() => {
        if (!widthLessThanXs) {
            const elem = document.getElementById("individual-timetable-header");
            if (!elem) return;
            elem.style.height = getHeaderHeight();
        }
    }, [widthLessThanXs, eventMember]);

    const handleTimeRangeChange = useCallback(
        (minVal: number, maxVal: number) => {
            // Need to check for eventID to solve issue #51.
            // See: https://github.com/Tymotex/Konflux/issues/51
            if (eventId) {
                updateStatus("pending");
                eventDispatch({
                    type: "SET_TIME_RANGE",
                    payload: {
                        eventId: eventId,
                        earliestTimeIndex: minVal,
                        latestTimeIndex: maxVal,
                        updateStatus,
                    },
                });
            }
        },
        [eventDispatch, eventId, updateStatus],
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

            {eventMember && (
                <TimetableGrid
                    username={eventMember.username}
                    eventId={eventId}
                    showGroupAvailability={showGroupAvailability}
                    gridClassName="individual"
                    startRow={eventState.earliest}
                    endRow={eventState.latest}
                    maxRows={48}
                    id="individual-timetable"
                    onScroll={syncScroll}
                    updateStatus={updateStatus}
                />
            )}
        </div>
    );
};

export default FillingTimetable;
