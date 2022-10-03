import { EventContext } from "contexts/event-context";
import { useDarkMode } from "contexts/ThemeProvider";
import dayjs from "dayjs";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";
import { spawnNotification } from "utils/notifications";
import { areaSelectionReducer, NO_SELECTION } from "./area-selection-reducer";
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
    showGroupAvailability?: boolean;
    getTimeBlockColour?: (date: string, timeBlockIndex: number) => string;
    gridClassName: "individual" | "group";
}

const TimetableGrid: React.FC<Props> = ({
    disabled = false,
    username,
    eventId,
    showGroupAvailability = false,
    getTimeBlockColour,
    gridClassName,
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

    const isDarkMode = useDarkMode();

    // When the user is selecting an area and lifts up their finger anywhere on
    // the <body>, add the selected time blocks to the `selectedBlocks`.
    // When the user's mouse exits the <body>, just abort the selection.
    // When the user is deselecting, we go by the same logic as above, except we
    // remove time blocks from `selectedBlocks` instead of adding.
    useEffect(() => {
        const commitAreaSelection = (e: Event) => {
            e.preventDefault();
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
            if (isLeftClicking && notTrackingAreaSelection) {
                selectionDispatch({
                    type: "BEGIN_SELECTION",
                    payload: {
                        isSelecting: !isSelected(date, timeBlockIndex),
                        startTime: timeBlockIndex,
                        startDate: date,
                    },
                });
            }
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

    /**
     * Gets the style properties that should be set for this time block.
     * - If the timeblock is for showing the group's availabilities, then time
     *   blocks take a colour corresponding to availabilities.
     * - All corners of the complete are rounded.
     * @param timeBlockIndex current row index of this time block.
     * @param columnIndex current column index of this time block. Should
     * satisfy: 0 <= columnIndex <= intervalLength.
     * @param date universal ISO date string YYYY-MM-DD.
     * @param intervalLength number of columns in this interval.
     * @param displayTimeLabels whether time labels are displayed in this grid.
     * This is needed to correctly offset the timeblock one column forward since
     * the date labels occupy the first column.
     * @param mode whether the timetable is meant for filling or for showing
     * the group's availabilities.
     */
    const getTimeBlockStyles = useCallback(
        (
            timeBlockIndex: number,
            columnIndex: number,
            date: string,
            intervalLength: number,
            displayTimeLabels: boolean,
            mode: "individual" | "group",
        ): React.CSSProperties => {
            const borderColour = isDarkMode
                ? "rgba(255, 255, 255, 0.3)"
                : "lightgrey";
            const hourBorder = `2px solid ${borderColour}`;
            const halfHourBorder = `2px dotted ${borderColour}`;

            const styles: React.CSSProperties = {
                height: "30px",
                // If the time block is positioned at a corner, give it a rounded corner.
                borderTopLeftRadius:
                    timeBlockIndex === 0 && columnIndex === 0 ? "12px" : "0",
                borderTopRightRadius:
                    timeBlockIndex === 0 && columnIndex === intervalLength - 1
                        ? "12px"
                        : "0",
                borderBottomRightRadius:
                    timeBlockIndex === 48 - 1 &&
                    columnIndex === intervalLength - 1
                        ? "12px"
                        : "0",
                borderBottomLeftRadius:
                    timeBlockIndex === 48 - 1 && columnIndex === 0
                        ? "12px"
                        : "0",
                gridRowStart: timeBlockIndex + 2,
                gridRowEnd: "span 1",
                gridColumnStart: columnIndex + (displayTimeLabels ? 2 : 1),
                gridColumnEnd: "span 1",
                borderTop:
                    timeBlockIndex % 2 === 0 ? hourBorder : halfHourBorder,
                borderLeft: hourBorder,
                borderBottom: timeBlockIndex === 48 - 1 ? hourBorder : "",
                borderRight:
                    columnIndex === intervalLength - 1 ? hourBorder : "",
            };

            // Apply group availabilities legend colouring to the time block.
            if (mode === "group") {
                styles.backgroundColor = getTimeBlockColour
                    ? getTimeBlockColour(date, timeBlockIndex)
                    : "";
            }
            return styles;
        },
        [isDarkMode, getTimeBlockColour],
    );

    return (
        <div
            className={`${styles.grid} ${
                gridClassName === "individual"
                    ? styles.individual
                    : styles.group
            } ${disabled && styles.disabled} ${isDarkMode ? styles.dark : ""}`}
            draggable={false}
        >
            {timeIntervals.map((interval, intervalIndex) => {
                const displayTimeLabels = intervalIndex === 0;
                return (
                    <div
                        key={intervalIndex}
                        className={styles.interval}
                        onDragStart={(e) => e.preventDefault()}
                    >
                        {displayTimeLabels &&
                            timeIntervals.length > 0 &&
                            TIME_LABELS.map((label, i) => (
                                <div
                                    key={`${label}-${i}`}
                                    className={styles.timeLabel}
                                    style={{
                                        gridColumnStart: 1,
                                        gridRowStart: i + 2,
                                    }}
                                >
                                    <span className={styles.text}>{label}</span>
                                </div>
                            ))}
                        {interval.map((date: string, columnIndex) => (
                            <>
                                {/* TODO: Move this to a separate component. */}
                                <span
                                    className={styles.dateLabel}
                                    style={{
                                        gridRowStart: 1,
                                        gridColumnStart:
                                            columnIndex +
                                            (displayTimeLabels ? 2 : 1),
                                        gridColumnEnd: "span 1",
                                    }}
                                >
                                    <span className={styles.date}>
                                        {dayjs(date).format("Do MMM")}
                                    </span>
                                    <span className={styles.dayOfWeek}>
                                        {dayjs(date).format("ddd")}
                                    </span>
                                </span>
                                {!showGroupAvailability
                                    ? [...Array(48)].map(
                                          (_, timeBlockIndex) => (
                                              // Showing the timetable for filling availabilities.
                                              <div
                                                  key={timeBlockIndex}
                                                  className={`${
                                                      styles.timeBlock
                                                  } ${
                                                      isSelected(
                                                          date,
                                                          timeBlockIndex,
                                                      )
                                                          ? styles.selected
                                                          : styles.notSelected
                                                  } ${
                                                      isInAreaSelection(
                                                          date,
                                                          timeBlockIndex,
                                                      )
                                                          ? selectionState.isSelectingArea
                                                              ? styles.inSelectedArea
                                                              : styles.inDeselectedArea
                                                          : ""
                                                  }`}
                                                  style={getTimeBlockStyles(
                                                      timeBlockIndex,
                                                      columnIndex,
                                                      date,
                                                      interval.length,
                                                      displayTimeLabels,
                                                      "individual",
                                                  )}
                                                  onClick={() =>
                                                      toggleTimeblockSelection(
                                                          date,
                                                          timeBlockIndex,
                                                      )
                                                  }
                                                  onMouseDown={(e) =>
                                                      setPressedClass(e, true)
                                                  }
                                                  onMouseUp={(e) => {
                                                      setPressedClass(e, false);
                                                  }}
                                                  onMouseLeave={(e) => {
                                                      setPressedClass(e, false);
                                                      beginSelectingArea(
                                                          e,
                                                          date,
                                                          timeBlockIndex,
                                                      );
                                                  }}
                                                  onMouseEnter={() => {
                                                      setSelectionAreaEnd(
                                                          date,
                                                          timeBlockIndex,
                                                      );
                                                  }}
                                              ></div>
                                          ),
                                      )
                                    : [...Array(48)].map(
                                          (_, timeBlockIndex) => (
                                              // Showing the timetable with group availabilities,
                                              // not for filling in individual availabilities.
                                              <div
                                                  key={timeBlockIndex}
                                                  className={`${styles.timeBlock}`}
                                                  style={getTimeBlockStyles(
                                                      timeBlockIndex,
                                                      columnIndex,
                                                      date,
                                                      interval.length,
                                                      displayTimeLabels,
                                                      "group",
                                                  )}
                                              ></div>
                                          ),
                                      )}
                            </>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default TimetableGrid;
