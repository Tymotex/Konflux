import { EventContext } from "contexts/event-context";
import dayjs from "dayjs";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";
import { spawnNotification } from "utils/notifications";
import { NO_SELECTION, areaSelectionReducer } from "./area-selection-reducer";
import {
    boundsAreValid,
    createIntervals,
    getStartAndEndRowsAndCols,
    TIME_LABELS,
} from "./timetable-utils";
import styles from "./Timetable.module.scss";

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
    const { eventState, eventDispatch } = useContext(EventContext);
    const [selectionState, selectionDispatch] = useReducer(
        areaSelectionReducer,
        NO_SELECTION,
    );

    // A list of lists of dates and group availability at those dates.
    // Used to render contiguous dates together and in chronological order.
    const timeIntervals = useMemo(
        () => createIntervals(eventState?.groupAvailabilities),
        [eventState],
    );

    // When the user is selecting an area and lifts up their finger anywhere on
    // the <body>, add the selected time blocks to the `selectedBlocks`.
    // When the user's mouse exits the <body>, just abort the selection.
    // When the user is deselecting, we go by the same logic as above, except we
    // remove time blocks from `selectedBlocks` instead of adding.
    useEffect(() => {
        const commitAreaSelection = () => {
            if (
                !selectionState.isSelectingArea &&
                !selectionState.isDeselectingArea
            )
                return;

            try {
                selectionDispatch({
                    type: "COMMIT_SELECTION",
                    payload: {
                        availabilities: eventState.groupAvailabilities,
                        username,
                        onCommit: (newAvailabilities) => {
                            eventDispatch({
                                type: "SET_AVAILABILITIES",
                                payload: {
                                    eventId: eventId,
                                    groupAvailabilities: newAvailabilities,
                                },
                            });
                        },
                    },
                });
            } catch (err) {
                if (err instanceof Error)
                    spawnNotification("error", err.message);
                else throw err;
            } finally {
                selectionDispatch({ type: "RESET" });
            }
        };

        // Cancel the area selection/deselection by doing nothing and resetting
        // the range-tracking state.
        const abortAreaSelection = () => {
            if (
                selectionState.isSelectingArea ||
                selectionState.isDeselectingArea
            )
                spawnNotification("warning", "Aborted selection");
            selectionDispatch({ type: "RESET" });
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
        eventState,
        eventDispatch,
        selectionState,
        selectionDispatch,
    ]);

    /**
     * Toggles the selection of the time block with the given index and date.
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     */
    const toggleTimeblockSelection = useCallback(
        (date: string, timeBlockIndex: number): void => {
            if (!(date in eventState.groupAvailabilities)) {
                spawnNotification(
                    "error",
                    `Error: timetable doesn't have date ${date}`,
                );
                return;
            }
            const newAvailabilities = { ...eventState.groupAvailabilities };
            const timeBlock = newAvailabilities[date][timeBlockIndex];
            if (timeBlock && username in timeBlock) {
                delete newAvailabilities[date][timeBlockIndex][username];
            } else {
                newAvailabilities[date][timeBlockIndex] = {
                    ...timeBlock,
                    [username]: { placeholder: true },
                };
            }

            eventDispatch({
                type: "SET_AVAILABILITIES",
                payload: {
                    eventId,
                    groupAvailabilities: newAvailabilities,
                },
            });
        },
        [eventState, eventDispatch, username, eventId],
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
            if (
                eventState?.groupAvailabilities &&
                eventState.groupAvailabilities[date]
            ) {
                const timeBlock =
                    eventState.groupAvailabilities[date][timeBlockIndex];
                return timeBlock && username in timeBlock;
            }
            return false;
        },
        [eventState, username],
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
                    selectionState.startTime,
                    selectionState.endTime,
                    selectionState.startDate,
                    selectionState.endDate,
                )
            )
                return false;

            const { startRow, endRow, startCol, endCol } =
                getStartAndEndRowsAndCols(
                    selectionState.startTime,
                    selectionState.endTime,
                    selectionState.startDate,
                    selectionState.endDate,
                );

            return (
                startRow <= timeBlockIndex &&
                timeBlockIndex <= endRow &&
                startCol <= date &&
                date <= endCol
            );
        },
        [selectionState],
    );
    /**
     * Begin selecting/deselecting an area of blocks when the user's mouse
     * leaves a time block while still holding the left mouse button.
     * Sets the state to begin the selection of an area.
     * @param event
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     */
    const beginSelectingArea = useCallback(
        (
            event: React.MouseEvent,
            date: string,
            timeBlockIndex: number,
        ): void => {
            const isLeftClicking = event.buttons === 1;
            const notTrackingAreaSelection = !(
                selectionState.isSelectingArea ||
                selectionState.isDeselectingArea
            );
            if (isLeftClicking && notTrackingAreaSelection)
                selectionDispatch({
                    type: "BEGIN_SELECTION",
                    payload: {
                        isSelecting: !isSelected(date, timeBlockIndex),
                        startTime: timeBlockIndex,
                        startDate: date,
                    },
                });
        },
        [selectionState, selectionDispatch, isSelected],
    );

    /**
     * Set the end coordinate of the rectangular area drawn by the user.
     * @param date universal ISO formatted string
     * @param timeBlockIndex a number from 0 to 48
     */
    const setSelectionAreaEnd = useCallback(
        (date: string, timeBlockIndex: number) => {
            selectionDispatch({
                type: "SET_SELECTION_END",
                payload: {
                    endTime: timeBlockIndex,
                    endDate: date,
                },
            });
        },
        [selectionDispatch],
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
                                        beginSelectingArea(e, date, i);
                                    }}
                                    onMouseEnter={() => {
                                        setSelectionAreaEnd(date, i);
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
