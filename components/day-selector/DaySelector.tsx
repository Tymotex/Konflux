import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";
import styles from "./DaySelector.module.scss";
import { toast } from "react-toastify";
import {
    FaChevronCircleLeft as LeftIcon,
    FaChevronCircleRight as RightIcon,
} from "react-icons/fa";
import dayjs, { Dayjs } from "dayjs";
import {
    getCalendarDays,
    WEEKDAYS,
    INITIAL_MONTH,
    INITIAL_YEAR,
    Day,
} from "./calendar-utils";

interface Props {
    selectedDays: Set<string>;
    setSelectedDays: Dispatch<SetStateAction<Set<string>>>;
}

const DaySelector: React.FC<Props> = ({ selectedDays, setSelectedDays }) => {
    // The days to be displayed on the calendar. By default, we start by showing
    // the days of the current month.
    const [days, setDays] = useState<Day[]>(
        getCalendarDays(INITIAL_YEAR, INITIAL_MONTH),
    );
    const [displayYear, setDisplayYear] = useState<string>(INITIAL_YEAR);
    const [displayMonth, setDislayMonth] = useState<string>(INITIAL_MONTH);

    // The user can select a range of days by pressing down on a starting day
    // then dragging their mouse and lifting up on an ending day on the
    // calendar.
    // While this is happening, we track 3 state variables to help us determine
    // which cells to apply styling to and what days should be added to the
    // `selectedDays` set:
    //   1. `isSelectingRange` which becomes true onMouseLeave from a starting
    //      day.
    //   2. `rangeStartDate` which is starting day of the range (where the
    //      user's mouse started and exited.
    //      Universal ISO format("YYYY-MM-DD").
    //   3. The last hovered day of the range.
    //      Universal ISO format("YYYY-MM-DD").
    const [isSelectingRange, setIsSelectingRange] = useState<boolean>(false);
    const [isDeselectingRange, setIsDeselectingRange] =
        useState<boolean>(false);
    const [rangeStartDate, setRangeStartDate] = useState<string>("");
    const [rangeEndDate, setRangeEndDate] = useState<string>("");

    // Resets all range-tracking variables. Should be called after committing or
    // aborting a range selection/deselection.
    const resetRangeTrackingState = useCallback(() => {
        setIsSelectingRange(false);
        setIsDeselectingRange(false);
        setRangeStartDate("");
        setRangeEndDate("");
    }, []);

    // When the user is selecting a range and lifts up their finger anywhere on
    // the <body>, add the selected ranges to the `selectedDays`.
    // When the user's mouse exits the <body>, just abort the range selection.
    // When the user is deselecting, we go by the same logic, except we remove
    // days from the `selectedDays` set instead of adding.
    useEffect(() => {
        // Commits the selected days in the range into the `selectedDays` set.
        const commitRangeSelection = () => {
            const newSelectedDays = new Set(selectedDays);
            const endDay = dayjs(
                rangeEndDate >= rangeStartDate ? rangeEndDate : rangeStartDate,
            );
            let currDay = dayjs(
                rangeStartDate <= rangeEndDate ? rangeStartDate : rangeEndDate,
            );

            while (currDay.isBefore(endDay) || currDay.isSame(endDay)) {
                // Adds or removes selected days if we're selecting or
                // deselecting respectively.
                if (isSelectingRange)
                    newSelectedDays.add(currDay.format("YYYY-MM-DD"));
                else if (isDeselectingRange)
                    newSelectedDays.delete(currDay.format("YYYY-MM-DD"));
                else {
                    // TODO: fatal err. What do?
                    toast.error("Neither selecting nor deselecting...");
                    resetRangeTrackingState();
                    return;
                }
                currDay = currDay.add(1, "day");
            }

            setSelectedDays(newSelectedDays);
            resetRangeTrackingState();
        };

        // Cancel the range selection/deselection by doing nothing and resetting
        // the range-tracking state.
        const abortRangeSelection = () => {
            resetRangeTrackingState();
        };

        // Attaching commit/abort functions as handlers to the document body.
        // We're attaching the mouse events on the body instead of on the
        // calendar UI since this allows the user to be less precise with their
        // mouse movement (when they let go of the click outside the calendar
        // instead of inside it).
        const body = document.querySelector("body");
        if (!body) {
            toast.error("Fatal error. Document body not found");
            return;
        }
        body.addEventListener("mouseup", commitRangeSelection);
        body.addEventListener("mouseleave", abortRangeSelection);
        return () => {
            body.removeEventListener("mouseup", commitRangeSelection);
            body.removeEventListener("mouseleave", abortRangeSelection);
        };
    }, [
        selectedDays,
        isDeselectingRange,
        setIsSelectingRange,
        setIsDeselectingRange,
        rangeStartDate,
        rangeEndDate,
        isSelectingRange,
        resetRangeTrackingState,
        setSelectedDays,
    ]);

    // When the user sets a different month in the calendar, rerender the day
    // grid to show the days of that new display month.
    useEffect(() => {
        setDays(getCalendarDays(displayYear, displayMonth));
    }, [displayMonth, displayYear]);

    // Show the days of the previous month.
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

    // Show the days of the next month.
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

    // Toggles whether the given date is selected.
    // Expects the string to be of the universal ISO format: "YYYY-MM-DD".
    const toggleDaySelection = useCallback(
        (date: string) => {
            const newSelectedDays = new Set(selectedDays);
            if (newSelectedDays.has(date)) {
                newSelectedDays.delete(date);
            } else {
                newSelectedDays.add(date);
            }
            setSelectedDays(newSelectedDays);
        },
        [selectedDays, setSelectedDays],
    );

    // Flips on the `isSelectingRange` or `isDeselectingRange` boolean state.
    const beginSelectingRange = useCallback(
        (startDate: string) => {
            if (!selectedDays.has(startDate)) setIsSelectingRange(true);
            else setIsDeselectingRange(true);

            setRangeStartDate(startDate);
        },
        [
            selectedDays,
            setIsSelectingRange,
            setIsDeselectingRange,
            setRangeStartDate,
        ],
    );

    // When the user's mouse leaves a day cell while still holding the left
    // mouse button, begin selecting/deselecting a range of days.
    const handleMouseLeave = useCallback(
        (e: React.MouseEvent, dateStr: string) => {
            const isLeftClicking = e.buttons === 1;
            const notTrackingRange = !(isSelectingRange || isDeselectingRange);
            if (isLeftClicking && notTrackingRange)
                beginSelectingRange(dateStr);
        },
        [isSelectingRange, isDeselectingRange, beginSelectingRange],
    );

    // Determines whether the given date (in the universal ISO format,
    // 'YYYY-MM-DD') is in the selection/deselection range spanning from
    // `rangeStartDate` to `rangeEndDate`.
    const isInRangeSelection = useCallback(
        (thisDate: string) => {
            if (!(rangeStartDate && rangeEndDate)) return false;

            const earlierDate =
                rangeStartDate <= rangeEndDate ? rangeStartDate : rangeEndDate;
            const laterDate =
                rangeStartDate <= rangeEndDate ? rangeEndDate : rangeStartDate;
            return earlierDate <= thisDate && thisDate <= laterDate;
        },
        [rangeStartDate, rangeEndDate],
    );

    return (
        <>
            <div className={styles.calendarMonth}>
                {/* Calendar header */}
                <section className={styles.header}>
                    <span onClick={renderPrevMonth}>
                        <LeftIcon className={styles.prevMonthButton} />
                    </span>
                    <div className={styles.selectedMonth}>
                        {dayjs(`${displayYear}-${displayMonth}-01`).format(
                            "MMM YYYY",
                        )}
                    </div>
                    <span onClick={renderNextMonth}>
                        <RightIcon className={styles.nextMonthButton} />
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
                                className={`${styles.day} ${
                                    !day.isCurrentMonth
                                        ? styles.notCurrentMonth
                                        : ""
                                } ${
                                    selectedDays.has(dateStr)
                                        ? styles.selected
                                        : styles.notSelected
                                } ${
                                    isInRangeSelection(dateStr)
                                        ? isDeselectingRange
                                            ? styles.inDeselectionRange
                                            : styles.inSelectionRange
                                        : ""
                                }`}
                                key={dateStr}
                                onClick={() => toggleDaySelection(dateStr)}
                                onMouseLeave={(e) =>
                                    handleMouseLeave(e, dateStr)
                                }
                                onMouseDown={(e) => {
                                    // Apply the `pressed` class to this element.
                                    const thisElem =
                                        e.target as HTMLUListElement;
                                    thisElem.classList.add(styles.pressed);
                                }}
                                onMouseEnter={() => {
                                    setRangeEndDate(dateStr);
                                }}
                            >
                                <span className={styles.number}>
                                    {day.date.format("D")}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>
            {/* <pre>Selecting? {isSelectingRange ? "YES" : "NO"}</pre>
            <pre>Deselect? {isDeselectingRange ? "YES" : "NO"}</pre>
            <pre>Start: {"    " + rangeStartDate?.slice(-2)}</pre>
            <pre>End: {"      " + rangeEndDate?.slice(-2)}</pre> */}
        </>
    );
};

export default DaySelector;
