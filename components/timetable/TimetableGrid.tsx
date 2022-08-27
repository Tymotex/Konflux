import { getNextDate } from "components/day-selector/calendar-utils";
import { EventContext } from "contexts/event-context";
import dayjs from "dayjs";
import { KonfluxEvent } from "models/event";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { spawnNotification } from "utils/notifications";
import {
    boundsAreValid,
    createIntervals,
    createNewAvailabilitiesAfterSelection,
    getStartAndEndRowsAndCols,
    TIME_LABELS,
} from "./timetable-utils";
import styles from "./Timetable.module.scss";

interface Props {
    disabled?: boolean;
    username: string;
    eventId: string;
}

// TODO: doc and move

const TimetableGrid: React.FC<Props> = ({
    disabled = false,
    username,
    eventId,
}) => {
    const { state, dispatch } = useContext(EventContext);

    // A list of lists of dates and group availability at those dates.
    // Used to render contiguous dates together and in chronological order.
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
        const commitAreaSelection = () => {
            if (!isSelectingArea && !isDeselectingArea) return;
            try {
                const newAvailabilities = createNewAvailabilitiesAfterSelection(
                    state.groupAvailabilities,
                    username,
                    selectionStartTime,
                    selectionEndTime,
                    selectionStartDate,
                    selectionEndDate,
                    isSelectingArea,
                    isDeselectingArea,
                );
                dispatch({
                    type: "SET_AVAILABILITIES",
                    payload: {
                        eventId: eventId,
                        groupAvailabilities: newAvailabilities,
                    },
                });
            } catch (err) {
                if (err instanceof Error)
                    spawnNotification("error", err.message);
                else throw err;
            } finally {
                resetRangeTrackingState();
            }
        };

        // Cancel the area selection/deselection by doing nothing and resetting
        // the range-tracking state.
        const abortAreaSelection = () => {
            if (isSelectingArea || isDeselectingArea)
                spawnNotification("warning", "Aborted selection");
            resetRangeTrackingState();
        };

        // Attaching commit/abort functions as handlers to the document body.
        // We're attaching the mouse events on the body instead of on the
        // timetable UI since this allows the user to be less precise with their
        // mouse movement (when they let go of the click outside the timetable
        // instead of inside it).
        const body = document.querySelector("body");
        if (!body) {
            spawnNotification("error", "Fatal error. Document body not found");
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

    /**
     * Toggles the selection of the time block with the given index and date.
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     */
    const toggleTimeblockSelection = useCallback(
        (date: string, timeBlockIndex: number): void => {
            if (!(date in state.groupAvailabilities)) {
                spawnNotification(
                    "error",
                    `Error: timetable doesn't have date ${date}`,
                );
                return;
            }
            const newAvailabilities = { ...state.groupAvailabilities };
            const timeBlock = newAvailabilities[date][timeBlockIndex];
            if (timeBlock && username in timeBlock) {
                delete newAvailabilities[date][timeBlockIndex][username];
            } else {
                newAvailabilities[date][timeBlockIndex] = {
                    ...timeBlock,
                    [username]: { placeholder: true },
                };
            }

            dispatch({
                type: "SET_AVAILABILITIES",
                payload: {
                    eventId,
                    groupAvailabilities: newAvailabilities,
                },
            });
        },
        [state, dispatch, username, eventId],
    );

    /**
     * Determines whether the time block at the given date and time block index
     * is selected.
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     * @returns whether the time block is selected.
     */
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

    /**
     * Sets the state to begin the selection of an area.
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     */
    const beginSelectingArea = useCallback(
        (date: string, timeBlockIndex: number): void => {
            if (!isSelected(date, timeBlockIndex)) setIsSelectingArea(true);
            else setIsDeselectingArea(true);

            setSelectionStartTime(timeBlockIndex);
            setSelectionStartDate(date);
        },
        [isSelected],
    );

    /**
     * Determines whether the given time block is in the selection/deselection
     * rectangular area drawn from:
     *   starting row: `selectionStartTime`
     *   starting col: `selectionStartDate`
     *   ending row:   `selectionEndTime`
     *   ending col:   `selectionEndTime`
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     * @returns whether the given time block is in the selection area drawn by
     * the user.
     */
    const isInAreaSelection = useCallback(
        (date: string, timeBlockIndex: number): boolean => {
            if (
                !boundsAreValid(
                    selectionStartTime,
                    selectionEndTime,
                    selectionStartDate,
                    selectionEndDate,
                )
            )
                return false;

            const { startRow, endRow, startCol, endCol } =
                getStartAndEndRowsAndCols(
                    selectionStartTime,
                    selectionEndTime,
                    selectionStartDate,
                    selectionEndDate,
                );

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

    /**
     * Begin selecting/deselecting an area of blocks when the user's mouse
     * leaves a time block while still holding the left mouse button.
     * @param event
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     */
    const handleMouseLeave = useCallback(
        (
            event: React.MouseEvent,
            date: string,
            timeBlockIndex: number,
        ): void => {
            const isLeftClicking = event.buttons === 1;
            const notTrackingAreaSelection = !(
                isSelectingArea || isDeselectingArea
            );
            if (isLeftClicking && notTrackingAreaSelection)
                beginSelectingArea(date, timeBlockIndex);
        },
        [isSelectingArea, isDeselectingArea, beginSelectingArea],
    );

    /**
     * Set the `pressed` class in response to an event, imperatively.
     */
    const setPressedClass = useCallback(
        (e: React.MouseEvent<HTMLElement>, apply: boolean = true) => {
            // Revoke the `pressed` class from this element.
            const thisElem = e.target as HTMLElement;
            apply
                ? thisElem.classList.add(styles.pressed)
                : thisElem.classList.remove(styles.pressed);
        },
        [],
    );

    return (
        <div className={`${styles.timetable} ${disabled && styles.disabled}`}>
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
                                    onMouseDown={(e) =>
                                        setPressedClass(e, true)
                                    }
                                    onMouseUp={(e) => {
                                        setPressedClass(e, false);
                                    }}
                                    onMouseLeave={(e) => {
                                        setPressedClass(e, false);
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
    );
};

export default TimetableGrid;
