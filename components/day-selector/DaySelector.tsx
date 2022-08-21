import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";
import styles from "./DaySelector.module.scss";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import { toast } from "react-toastify";

// Make the Weekday plugin available through `dayjs`.
// See: https://day.js.org/docs/en/plugin/weekday.
dayjs.extend(weekday);

// TODO: in .scss, clear out magic numbers as much as possible.
// TODO: write some Jest unit tests for these utilities.
// TODO: Move these utilities and constants to a separate .ts file
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const INITIAL_YEAR = dayjs().format("YYYY");
const INITIAL_MONTH = dayjs().format("M");

interface Day {
    date: Dayjs;
    dayOfMonth: number;
    isCurrentMonth: boolean;
}

/**
 * Determines how many days there are in the given year's given month. For
 * example, there are 31 days in August 2022.
 * @param year
 * @param month
 * @returns
 * @example
 * const numDays = getNumberofDaysInMonth('2022', '08');
 */
const getNumberOfDaysInMonth = (year: string, month: string): number =>
    dayjs(`${year}-${month}-01`).daysInMonth();

/**
 * Forms a list of days in the given year & month.
 * @param year
 * @param month
 * @returns Array of days in the month
 * @example
 * const days = getAllDaysInMonth('2022', '08');
 */
const getAllDaysInMonth = (year: string, month: string): Day[] => {
    return [...Array(getNumberOfDaysInMonth(year, month))].map((_, day) => ({
        date: dayjs(`${year}-${month}-${day + 1}`),
        dayOfMonth: day + 1,
        isCurrentMonth: true,
    }));
};

/**
 * Returns the date's day in the week. For example, 2022-07-01 is a Friday, so
 * `getWeekday` would return 4.
 * @param date
 * @returns a number in range [0, 6] representing Monday to Sunday.
 * @example
 * const dayOfWeek = getWeekday(new Date());
 */
const getWeekday = (date: Dayjs): number => {
    // Dayjs actually returns a number in range [0, 6] with Monday being 1 and
    // Sunday at 0. We need to normalise this so that Monday is 0 and Sunday is
    // 6.
    let weekday = dayjs(date).weekday();
    if (weekday === 0) weekday = 7;
    return weekday - 1;
};

/**
 * Gets an array of what should be the leading days from the previous month to
 * be displayed on the first row of the calendar.
 * Why? If we want to render the days of July 2022, the problem is that the
 * 1st of July starts on a Friday. It's ideal to also show 27th Aug, 28th Aug,
 * 29th Aug and 30th Aug and then 1st of July on the first row. This funciton
 * returns those dates from the previous month.
 * @param year
 * @param month
 * @returns Array of leading days to display on the first row before the first
 * date of the current month.
 * @example
 * const leadingDays = getLeadingDays("2022", "07");
 */
const getLeadingDays = (year: string, month: string): Day[] => {
    const firstDayThisMonth = dayjs(`${year}-${month}-01`);

    // If the first day this month is a Friday, then the number of leading days
    // from the previous month is equal to 4 (the first row should show the last
    // Mon, Tue, Wed, Thu of the previous month).
    const numLeadingDays = getWeekday(firstDayThisMonth);

    const prevMonth = firstDayThisMonth.subtract(1, "month");

    // Get the last monday of the previous month's date, a number in the range
    // [1, 31].
    const lastMondayOfPrevMonth = firstDayThisMonth
        .subtract(numLeadingDays, "day")
        .date();

    return [...Array(numLeadingDays)].map((_, i) => ({
        date: dayjs(
            `${prevMonth.year()}-${prevMonth.month() + 1}-${
                lastMondayOfPrevMonth + i
            }`,
        ),
        dayOfMonth: lastMondayOfPrevMonth + i,
        isCurrentMonth: false,
    }));
};

/**
 * Gets an array of what should be the trailing days in the next month to
 * be displayed on the last row of the calendar for this month.
 * Why? If we want to render the days of August 2022, the problem is that the
 * 31st of August is a Wednesday. It's ideal to also show the days: 1st Sep,
 * 2nd Sep, 3rd Sep, 4th Sep to pad out the last row. This funciton returns
 * those dates in the next month.
 * @param year
 * @param month
 * @returns Array of trailing days to display on the last row after the last
 * date of the current month.
 * @example
 * const trailingDays = getTrailingDays("2022", "08");
 */
const getTrailingDays = (year: string, month: string): Day[] => {
    const lastDayThisMonth = dayjs(
        `${year}-${month}-${getNumberOfDaysInMonth(year, month)}`,
    );

    // If the last day this month is a Friday, then the number of leading days
    // from the next month should be 2 (the last row should show the remaining
    // Saturday and Sunday from next month).
    const numTrailingDays = 6 - getWeekday(lastDayThisMonth);

    const nextMonth = dayjs(`${year}-${month}-01`).add(1, "month");

    return [...Array(numTrailingDays)].map((_, i) => ({
        date: dayjs(`${nextMonth.year()}-${nextMonth.month() + 1}-${i + 1}`),
        dayOfMonth: i + 1,
        isCurrentMonth: false,
    }));
};

const getCalendarDays = (
    year: string = INITIAL_YEAR,
    month: string = INITIAL_MONTH,
): Day[] => {
    return [
        ...getLeadingDays(year, month),
        ...getAllDaysInMonth(year, month),
        ...getTrailingDays(year, month),
    ];
};

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
    const [rangeStartDate, setRangeStartDate] = useState<string>("");
    const [rangeEndDate, setRangeEndDate] = useState<string>("");

    // When the user is selecting a range and lifts up their finger anywhere on
    // the <body>, add the selected ranges to the `selectedDays`.
    // When the user's mouse exits the <body>, just abort the range selection.
    useEffect(() => {
        const commitRangeSelection = () => {
            // toast.success("Committing range selection");
            setIsSelectingRange(false);
            setRangeStartDate("");
            setRangeEndDate("");
        };
        const abortRangeSelection = () => {
            setIsSelectingRange(false);
            setRangeStartDate("");
            setRangeEndDate("");
        };

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
    }, [setIsSelectingRange, rangeStartDate, rangeEndDate]);

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

    // TODO: documentation
    const beginSelectingRange = useCallback(
        (startDate: string) => {
            setIsSelectingRange(true);
            setRangeStartDate(startDate);
        },
        [setIsSelectingRange, setRangeStartDate],
    );

    // TODO: documentation
    const isInRangeSelection = useCallback(
        (thisDate: string) => {
            if (!(rangeStartDate && rangeEndDate)) return false;
            return rangeStartDate <= thisDate && thisDate <= rangeEndDate;
            // TODO: Remove:
            // console.log(
            //     `Checking if ${rangeStartDate} <= ${thisDate} <= ${rangeEndDate}: `,
            //     dayjs(rangeStartDate).isBefore(thisDate) &&
            //         dayjs(rangeEndDate).isAfter(thisDate),
            // );
            // return (
            //     dayjs(rangeStartDate).isBefore(thisDate) &&
            //     dayjs(rangeEndDate).isAfter(thisDate)
            // );
        },
        [rangeStartDate, rangeEndDate],
    );

    return (
        <>
            <div className={styles.calendarMonth}>
                {/* Calendar header */}
                <section className={styles.header}>
                    <div className={styles.selectedMonth}>
                        {dayjs(`${displayYear}-${displayMonth}-01`).format(
                            "MMM YYYY",
                        )}
                    </div>
                    {/* Paginator */}
                    <div className={styles.monthSelector}>
                        <span onClick={renderPrevMonth}>←</span>
                        <span onClick={renderNextMonth}>→</span>
                    </div>
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
                                        : ""
                                } ${
                                    isInRangeSelection(dateStr)
                                        ? styles.inSelectionRange
                                        : ""
                                }`}
                                key={dateStr}
                                onClick={() => toggleDaySelection(dateStr)}
                                onMouseLeave={(e) => {
                                    if (e.buttons === 1 && !isSelectingRange) {
                                        beginSelectingRange(dateStr);
                                        toast.success("SELECTING RANGE");
                                    }
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
            <pre>Selecting? {isSelectingRange ? "YES" : "NO"}</pre>
            <pre>Start: {"    " + rangeStartDate?.slice(-2)}</pre>
            <pre>End: {"      " + rangeEndDate?.slice(-2)}</pre>
        </>
    );
};

export default DaySelector;
