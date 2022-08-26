import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { EventContext } from "pages/events/[eventId]";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { toast } from "react-toastify";
import { createIntervals, TIME_LABELS } from "./timetable-utils";
import styles from "./Timetable.module.scss";

// TODO: move this to somewhere else. Should only have to run once and then never again.
dayjs.extend(advancedFormat);

interface Props {
    disabled?: boolean;
    username: string;
    eventId: string;
}

const TimetableGrid: React.FC<Props> = ({
    disabled = false,
    username,
    eventId,
}) => {
    const { state, dispatch } = useContext(EventContext);

    const timeIntervals = useMemo(
        () => createIntervals(state.groupAvailabilities),
        [state],
    );

    // TODO: refactor to use reducer.
    // State for tracking whether the user is selecting or deselecting a
    // rectangular area of time blocks.
    const [isSelectingArea, setIsSelectingArea] = useState<boolean>(false);
    const [isDeselectingArea, setIsDeselectingArea] = useState<boolean>(false);

    // State for tracking the rectangular area drawn by the user from one
    // time block on the grid to another.
    const [selectionStartTime, setSelectionStartTime] = useState<number>();
    const [selectionStartDate, setSelectionStartDate] = useState<string>();
    const [selectionEndTime, setSelectionEndTime] = useState<number>();
    const [selectionEndDate, setSelectionEndDate] = useState<string>();

    // Resets all range-tracking variables. Should be called after committing or
    // aborting a range selection/deselection.
    const resetRangeTrackingState = useCallback(() => {
        setIsSelectingArea(false);
        setIsDeselectingArea(false);
        setSelectionStartDate("");
        setSelectionStartTime(undefined);
        setSelectionEndDate("");
        setSelectionEndTime(undefined);
    }, []);

    // When the user is selecting an area and lifts up their finger anywhere on
    // the <body>, add the selected time blocks to the `selectedBlocks`.
    // When the user's mouse exits the <body>, just abort the selection.
    // When the user is deselecting, we go by the same logic as above, except we
    // remove time blocks from `selectedBlocks` instead of adding.
    useEffect(() => {
        // Commits the time blocks in the selected area into `selectedBlocks`.
        const commitAreaSelection = () => {
            // Iterate through each time block within the rectangular are
            // defined by the start time/date and end time/date.
            // TODO: this bound validity checking logic is duplicated (I think).
            if (
                selectionStartTime === undefined ||
                selectionEndTime === undefined ||
                !selectionStartDate ||
                !selectionEndDate
            ) {
                // TODO: fatal error. what do?
                // toast.error("Rectangular bounds not correctly set");
                return;
            }
            const startRow =
                selectionStartTime <= selectionEndTime
                    ? selectionStartTime
                    : selectionEndTime;
            const endRow =
                selectionStartTime <= selectionEndTime
                    ? selectionEndTime
                    : selectionStartTime;
            const startCol =
                selectionStartDate <= selectionEndDate
                    ? selectionStartDate
                    : selectionEndDate;
            const endCol =
                selectionStartDate <= selectionEndDate
                    ? selectionEndDate
                    : selectionStartDate;

            const newAvailabilities = { ...state.groupAvailabilities };
            for (
                let timeBlockIndex = startRow;
                timeBlockIndex <= endRow;
                ++timeBlockIndex
            ) {
                let currDate = startCol;
                while (currDate <= endCol) {
                    // It's possible for the current date to not exist in the
                    // `selectedBlocks` map because of discontinuity in the
                    // selected days. In this case, we simply skip.
                    if (!(currDate in newAvailabilities)) {
                        currDate = dayjs(currDate)
                            .add(1, "day")
                            .format("YYYY-MM-DD");
                        continue;
                    }

                    // Add or remove the current timeblock in the rectangular
                    // area depending on if we're selecting or deselecting.
                    // TODO: refactor this area. It's messy.
                    if (isSelectingArea) {
                        newAvailabilities[currDate][timeBlockIndex] = {
                            ...newAvailabilities[currDate][timeBlockIndex],
                            [username]: { placeholder: true },
                        };
                    } else if (isDeselectingArea) {
                        if (
                            newAvailabilities[currDate][timeBlockIndex] &&
                            username in
                                newAvailabilities[currDate][timeBlockIndex]
                        )
                            delete newAvailabilities[currDate][timeBlockIndex][
                                username
                            ];
                    } else {
                        // TODO: Really, we should extract notifications to its own component.
                        toast.error(
                            "Error: neither selecting nor deselecting. Please try again.",
                        );
                        resetRangeTrackingState();
                        return;
                    }
                    currDate = dayjs(currDate)
                        .add(1, "day")
                        .format("YYYY-MM-DD");
                }
            }
            dispatch({
                type: "SET_DAYS",
                payload: {
                    eventId: eventId,
                    groupAvailabilities: newAvailabilities,
                },
            });
            resetRangeTrackingState();
        };

        // Cancel the area selection/deselection by doing nothing and resetting
        // the range-tracking state.
        const abortAreaSelection = () => {
            if (isSelectingArea || isDeselectingArea)
                toast.warning("Aborted selection");
            resetRangeTrackingState();
        };

        // Attaching commit/abort functions as handlers to the document body.
        // We're attaching the mouse events on the body instead of on the
        // timetable UI since this allows the user to be less precise with their
        // mouse movement (when they let go of the click outside the timetable
        // instead of inside it).
        const body = document.querySelector("body");
        if (!body) {
            toast.error("Fatal error. Document body not found");
            return;
        }
        body.addEventListener("mouseup", commitAreaSelection);
        body.addEventListener("mouseleave", abortAreaSelection);
        return () => {
            body.removeEventListener("mouseup", commitAreaSelection);
            body.removeEventListener("mouseleave", abortAreaSelection);
        };
    }, [
        eventId,
        username,
        setIsSelectingArea,
        setIsDeselectingArea,
        isSelectingArea,
        isDeselectingArea,
        resetRangeTrackingState,
        selectionStartDate,
        selectionStartTime,
        selectionEndDate,
        selectionEndTime,
        state,
        dispatch,
    ]);

    // TODO: doc
    const toggleTimeblockSelection = useCallback(
        (date: string, timeBlockIndex: number) => {
            if (!(date in state.groupAvailabilities)) {
                toast.error(`Error: timetable doesn't have date ${date}`);
                return;
            }
            const newAvailabilities = { ...state.groupAvailabilities };
            if (
                newAvailabilities[date][timeBlockIndex] &&
                username in newAvailabilities[date][timeBlockIndex]
            ) {
                delete newAvailabilities[date][timeBlockIndex][username];
            } else {
                newAvailabilities[date][timeBlockIndex] = {
                    ...newAvailabilities[date][timeBlockIndex],
                    [username]: { placeholder: true },
                };
            }

            console.log(newAvailabilities);

            dispatch({
                type: "SET_DAYS",
                payload: {
                    eventId,
                    groupAvailabilities: newAvailabilities,
                },
            });
        },
        [state, dispatch, username, eventId],
    );

    // TODO: doc
    const isSelected = useCallback(
        (date: string, timeBlockIndex: number): boolean => {
            if (state?.groupAvailabilities && state.groupAvailabilities[date])
                return (
                    state.groupAvailabilities[date][timeBlockIndex] &&
                    username in state.groupAvailabilities[date][timeBlockIndex]
                );
            return false;
        },
        [state, username],
    );

    // TODO: doc
    const beginSelectingArea = useCallback(
        (date: string, timeBlockIndex: number) => {
            if (!isSelected(date, timeBlockIndex)) setIsSelectingArea(true);
            else setIsDeselectingArea(true);

            setSelectionStartTime(timeBlockIndex);
            setSelectionStartDate(date);
        },
        [isSelected],
    );

    // Determines whether the given time block is in the selection/deselection
    // rectangular area drawn from:
    //   starting row: `selectionStartTime`
    //   starting col: `selectionStartDate`
    //   ending row:   `selectionEndTime`
    //   ending col:   `selectionEndTime`
    const isInAreaSelection = useCallback(
        (date: string, timeBlockIndex: number) => {
            if (
                !(
                    selectionStartTime !== undefined &&
                    selectionStartDate &&
                    selectionEndTime !== undefined &&
                    selectionEndDate
                )
            ) {
                return false;
            }

            const startRow =
                selectionStartTime <= selectionEndTime
                    ? selectionStartTime
                    : selectionEndTime;
            const endRow =
                selectionStartTime <= selectionEndTime
                    ? selectionEndTime
                    : selectionStartTime;
            const startCol =
                selectionStartDate <= selectionEndDate
                    ? selectionStartDate
                    : selectionEndDate;
            const endCol =
                selectionStartDate <= selectionEndDate
                    ? selectionEndDate
                    : selectionStartDate;

            return (
                startRow <= timeBlockIndex &&
                timeBlockIndex <= endRow &&
                startCol <= date &&
                date <= endCol
            );
        },
        [
            selectionStartTime,
            selectionStartDate,
            selectionEndTime,
            selectionEndDate,
        ],
    );

    // When the user's mouse leaves a time block while still holding the left
    // mouse button, begin selecting/deselecting an area of blocks.
    const handleMouseLeave = useCallback(
        (e: React.MouseEvent, date: string, timeBlockIndex: number) => {
            const isLeftClicking = e.buttons === 1;
            const notTrackingAreaSelection = !(
                isSelectingArea || isDeselectingArea
            );
            if (isLeftClicking && notTrackingAreaSelection)
                beginSelectingArea(date, timeBlockIndex);
        },
        [isSelectingArea, isDeselectingArea, beginSelectingArea],
    );

    return (
        <>
            {/* <pre>Selecting area? {isSelectingArea ? "YES" : "NO"}</pre>
            <pre>Deselect area? {isDeselectingArea ? "YES" : "NO"}</pre>
            <pre>Start time? {selectionStartTime}</pre>
            <pre>Start date? {selectionStartDate}</pre>
            <pre>End time? {selectionEndTime}</pre>
            <pre>End date? {selectionEndDate}</pre> */}
            <div
                className={`${styles.timetable} ${disabled && styles.disabled}`}
            >
                <div className={styles.timeBlockLabels}>
                    {timeIntervals.length > 0 &&
                        TIME_LABELS.map((label) => (
                            <span key={label} className={styles.label}>
                                {label}
                            </span>
                        ))}
                </div>
                {timeIntervals.map((interval, i) => (
                    <div key={i} className={styles.columnGroup}>
                        {interval.map((date) => (
                            <div key={date} className={styles.column}>
                                <span className={styles.dateLabel}>
                                    {dayjs(date).format("Do MMM")}
                                </span>
                                {[...Array(48)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.timeBlock} ${
                                            isSelected(date, i)
                                                ? styles.selected
                                                : styles.notSelected
                                        } ${
                                            isInAreaSelection(date, i)
                                                ? styles.inSelectedArea
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleTimeblockSelection(date, i)
                                        }
                                        onMouseDown={(e) => {
                                            // Apply the `pressed` class to this element.
                                            const thisElem =
                                                e.target as HTMLUListElement;
                                            thisElem.classList.add(
                                                styles.pressed,
                                            );
                                        }}
                                        onMouseUp={(e) => {
                                            // TODO: this is duplicated.
                                            // Revoke the `pressed` class from this element.
                                            const thisElem =
                                                e.target as HTMLUListElement;
                                            thisElem.classList.remove(
                                                styles.pressed,
                                            );
                                        }}
                                        onMouseLeave={(e) => {
                                            // Revoke the `pressed` class from this element.
                                            const thisElem =
                                                e.target as HTMLUListElement;
                                            thisElem.classList.remove(
                                                styles.pressed,
                                            );
                                            handleMouseLeave(e, date, i);
                                        }}
                                        onMouseEnter={() => {
                                            setSelectionEndTime(i);
                                            setSelectionEndDate(date);
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

export default TimetableGrid;
