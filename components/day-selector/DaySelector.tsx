import { EventAction } from "contexts/event-context";
import { useDarkMode } from "contexts/ThemeProvider";
import dayjs from "dayjs";
import { KonfluxEvent } from "models/event";
import React, {
    Dispatch,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from "react";
import {
    FaChevronLeft as LeftIcon,
    FaChevronRight as RightIcon,
} from "react-icons/fa";
import { spawnNotification } from "utils/notifications";
import {
    Day,
    getCalendarDays,
    INITIAL_MONTH,
    INITIAL_YEAR,
    WEEKDAYS,
} from "./calendar-utils";
import styles from "./DaySelector.module.scss";
import { NO_SELECTION, rangeSelectionReducer } from "./range-selector-reducer";

interface Props {
    eventId: string;
    eventState: KonfluxEvent;
    eventDispatch: Dispatch<EventAction>;
    // Optionally override the initial display years and months.
    initYear?: string;
    initMonth?: string;
}

const DaySelector: React.FC<Props> = ({
    eventId,
    initYear = INITIAL_YEAR,
    initMonth = INITIAL_MONTH,
    eventState,
    eventDispatch,
}) => {
    // The days to be displayed on the calendar. By default, we start by showing
    // the days of the current month.
    const [days, setDays] = useState<Day[]>(
        getCalendarDays(INITIAL_YEAR, INITIAL_MONTH),
    );
    const [displayYear, setDisplayYear] = useState<string>(initYear);
    const [displayMonth, setDislayMonth] = useState<string>(initMonth);

    const isDarkMode = useDarkMode();

    /**
     * The user can select a range of days by pressing down on a starting day
     * then dragging their mouse and lifting up on an ending day on the
     * calendar.
     */
    const [selectionState, selectionDispatch] = useReducer(
        rangeSelectionReducer,
        NO_SELECTION,
    );

    /**
     * When the user is selecting a range and lifts up their finger anywhere on
     * the <body>, add the selected ranges to the `selectedDays`.
     * When the user's mouse exits the <body>, just abort the range selection.
     * When the user is deselecting, we go by the same logic, except we remove
     * days from the `selectedDays` set instead of adding.
     */
    useEffect(() => {
        // Commits the selected days in the range into the `selectedDays` set.
        const commitRangeSelection = () => {
            if (
                !selectionState.isSelectingRange &&
                !selectionState.isDeselectingRange
            )
                return;
            try {
                selectionDispatch({
                    type: "COMMIT_SELECTION",
                    payload: {
                        availabilities: eventState.groupAvailabilities,
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
                throw err;
            } finally {
                selectionDispatch({ type: "RESET" });
            }
        };

        // Cancel the range selection/deselection by doing nothing and resetting
        // the range-tracking state.
        const abortRangeSelection = () => {
            selectionDispatch({ type: "RESET" });
        };

        // Attaching commit/abort functions as handlers to the document body.
        // We're attaching the mouse events on the body instead of on the
        // calendar UI since this allows the user to be less precise with their
        // mouse movement (when they let go of the click outside the calendar
        // instead of inside it).
        const body = document.querySelector("body");
        if (!body) {
            spawnNotification("error", "Fatal error. Document body not found");
            return;
        }
        body.addEventListener("mouseup", commitRangeSelection);
        body.addEventListener("mouseleave", abortRangeSelection);
        return () => {
            body.removeEventListener("mouseup", commitRangeSelection);
            body.removeEventListener("mouseleave", abortRangeSelection);
        };
    }, [eventDispatch, eventState, eventId, selectionState, selectionDispatch]);

    /**
     * When the user sets a different month in the calendar, rerender the day
     * grid to show the days of that new display month.
     */
    useEffect(() => {
        setDays(getCalendarDays(displayYear, displayMonth));
    }, [displayMonth, displayYear]);

    /**
     * Show the days of the previous month.
     */
    const renderPrevMonth = useCallback(() => {
        setDislayMonth((m) => {
            if (Number(m) === 1) {
                setDisplayYear((y) => String(Number(y) - 1));
                return "12";
            } else {
                return String(Number(m) - 1);
            }
        });
    }, []);

    /**
     * Show the days of the next month.
     */
    const renderNextMonth = useCallback(() => {
        setDislayMonth((m) => {
            if (Number(m) === 12) {
                setDisplayYear((y) => String(Number(y) + 1));
                return "1";
            } else {
                return String(Number(m) + 1);
            }
        });
    }, []);

    /**
     * Toggles whether the given date is selected.
     * Expects the string to be of the universal ISO format: "YYYY-MM-DD".
     */
    const toggleDaySelection = useCallback(
        (date: string) => {
            const newAvailabilities = { ...eventState.groupAvailabilities };
            if (date in newAvailabilities) {
                delete newAvailabilities[date];
            } else {
                newAvailabilities[date] = { placeholder: true };
            }
            eventDispatch({
                type: "SET_AVAILABILITIES",
                payload: {
                    eventId: eventId,
                    groupAvailabilities: newAvailabilities,
                },
            });
        },
        [eventState, eventDispatch, eventId],
    );

    /**
     * Determines whether the given date has been selected.
     */
    const isSelected = useCallback(
        (date: string) => {
            return (
                eventState?.groupAvailabilities !== undefined &&
                date in eventState.groupAvailabilities
            );
        },
        [eventState],
    );

    /**
     * When the user's mouse leaves a day cell while still holding the left
     * mouse button, begin selecting/deselecting a range of days.
     */
    const handleMouseLeave = useCallback(
        (e: React.MouseEvent, dateStr: string) => {
            const isLeftClicking = e.buttons === 1;
            const notTrackingRange = !(
                selectionState.isSelectingRange ||
                selectionState.isDeselectingRange
            );
            if (isLeftClicking && notTrackingRange)
                selectionDispatch({
                    type: "BEGIN_SELECTION",
                    payload: {
                        isSelecting: !isSelected(dateStr),
                        startDate: dateStr,
                    },
                });
        },
        [selectionState, selectionDispatch, isSelected],
    );

    /**
     * Determines whether the given date (in the universal ISO format,
     * 'YYYY-MM-DD') is in the selection/deselection range spanning from
     * `rangeStartDate` to `rangeEndDate`.
     */
    const isInRangeSelection = useCallback(
        (thisDate: string) => {
            if (
                !selectionState.isSelectingRange &&
                !selectionState.isDeselectingRange
            )
                return false;
            const earlierDate =
                selectionState.startDate <= selectionState.endDate
                    ? selectionState.startDate
                    : selectionState.endDate;
            const laterDate =
                selectionState.startDate <= selectionState.endDate
                    ? selectionState.endDate
                    : selectionState.startDate;
            return earlierDate <= thisDate && thisDate <= laterDate;
        },
        [selectionState],
    );

    return (
        <div
            className={`${styles.calendarMonth} ${
                isDarkMode ? styles.dark : ""
            }`}
            style={{
                cursor:
                    selectionState.isSelectingRange ||
                    selectionState.isDeselectingRange
                        ? "move"
                        : "",
            }}
        >
            {/* Calendar header */}
            <section className={styles.header}>
                <span
                    data-testid="prev-month"
                    className={styles.prevMonthButton}
                    onClick={renderPrevMonth}
                >
                    <LeftIcon />
                </span>
                <div className={styles.selectedMonth}>
                    {dayjs(`${displayYear}-${displayMonth}-01`).format(
                        "MMM YYYY",
                    )}
                </div>
                <span
                    data-testid="next-month"
                    className={styles.nextMonthButton}
                    onClick={renderNextMonth}
                >
                    <RightIcon />
                </span>
            </section>

            {/* Calendar days of week bar */}
            <ol className={styles.daysOfWeek}>
                {WEEKDAYS.map((weekday) => (
                    <li key={weekday}>{weekday}</li>
                ))}
            </ol>

            {/* Calendar grid */}
            <ol className={styles.dayGrid}>
                {days?.map((day) => {
                    const dateStr = day.date.format("YYYY-MM-DD");
                    return (
                        <li
                            data-testid={`date-${dateStr}`}
                            className={`${styles.dayCell} ${
                                !day.isCurrentMonth
                                    ? styles.notCurrentMonth
                                    : ""
                            } ${
                                isSelected(dateStr)
                                    ? styles.selected
                                    : styles.notSelected
                            } ${
                                isInRangeSelection(dateStr)
                                    ? selectionState.isDeselectingRange
                                        ? styles.inDeselectionRange
                                        : styles.inSelectionRange
                                    : ""
                            }`}
                            key={dateStr}
                            onClick={() => toggleDaySelection(dateStr)}
                            onMouseLeave={(e) => handleMouseLeave(e, dateStr)}
                            onMouseDown={(e) => {
                                // Apply the `pressed` class to this element.
                                const thisElem = e.target as HTMLUListElement;
                                thisElem.classList.add(styles.pressed);
                            }}
                            onMouseUp={(e) => {
                                // Revoke the `pressed` class to this element.
                                const thisElem = e.target as HTMLUListElement;
                                thisElem.classList.remove(styles.pressed);
                            }}
                            onMouseEnter={() => {
                                selectionDispatch({
                                    type: "SET_SELECTION_END",
                                    payload: { endDate: dateStr },
                                });
                            }}
                            style={{
                                cursor:
                                    selectionState.isDeselectingRange ||
                                    selectionState.isSelectingRange
                                        ? "move"
                                        : "pointer",
                            }}
                        >
                            <span
                                aria-label={day.date.format("YYYY-MM-DD")}
                                className={styles.day}
                            >
                                {day.date.format("D")}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default DaySelector;
