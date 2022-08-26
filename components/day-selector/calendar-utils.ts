import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import advancedFormat from "dayjs/plugin/advancedFormat";

// Make the Weekday plugin available through `dayjs`.
// See: https://day.js.org/docs/en/plugin/weekday.
dayjs.extend(weekday);
dayjs.extend(advancedFormat);

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const INITIAL_YEAR = dayjs().format("YYYY");
export const INITIAL_MONTH = dayjs().format("M");

export interface Day {
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

/**
 * Forms an array of all the days that should be rendered on a calendar,
 * including days from the given month and also all the days from the previous
 * and next month that are needed to align the displayed days to Monday.
 * @param year
 * @param month
 * @returns
 */
export const getCalendarDays = (
    year: string = INITIAL_YEAR,
    month: string = INITIAL_MONTH,
): Day[] => {
    return [
        ...getLeadingDays(year, month),
        ...getAllDaysInMonth(year, month),
        ...getTrailingDays(year, month),
    ];
};
