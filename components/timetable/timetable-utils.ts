import dayjs from "dayjs";
import { DayAvailabilities, TimeInterval } from "./Timetable";

/**
 * From the set `selectedDays`, create a sorted array of intervals containing
 * contiguous days.
 * Example:
 *   Suppose `selectedDays` is["2022-08-03", "2022-08-04", "2022-08-07"].
 *   This function is expected to return:
 *     [
 *       [{ date: "2022-08-03" }, { date: "2022-08-04" }],
 *       [{ date: "2022-08-07" }]
 *     ]
 *
 * @param selectedDays set of dates (universal ISO standard format).
 * @returns
 * Sorted array of arrays of contiguous time intervals.
 */
export const createIntervals = (selectedDays: Set<string>): TimeInterval[] => {
    const days = Array.from(selectedDays)
        .sort()
        .map(
            (date: string): DayAvailabilities => ({
                date: date,
                whoIsAvailable: [...Array(48)].map(() => []),
            }),
        );

    const contiguousDays: TimeInterval[] = [];
    let prevDay: DayAvailabilities | null = null;
    days.forEach((day) => {
        // Use the first day to create the first interval.
        if (!prevDay) {
            prevDay = day;
            contiguousDays.push([day]);
            return;
        }
        // If the current day is 1 day ahead of the previous day, then
        // merge it in the same interval, otherwise start a new one.
        if (
            dayjs(day.date).subtract(1, "day").format("YYYY-MM-DD") ===
            prevDay.date
        ) {
            contiguousDays[contiguousDays.length - 1].push(day);
        } else {
            contiguousDays.push([day]);
        }
        prevDay = day;
    });

    return contiguousDays;
};
