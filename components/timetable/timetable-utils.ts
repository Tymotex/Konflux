import dayjs from "dayjs";
import { DayAvailabilities, TimeInterval } from "./Timetable";

// A map of universal ISO date strings to an array of timeblocks which are
// either filled (indiciating availability) or empty.
// Each index in the boolean array corresponds to a time block.
export interface FilledSchedule {
    [day: string]: IndividualAvailabilities;
}

// A single person's availabilities. This is meant to be used by the timetable
// for filling out availabilities, not for showing the group's availabilities.
export type IndividualAvailabilities = boolean[];

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

/**
 * Converts the given `FilledSchedules` data structure into a `TimeInterval[]`,
 * adding the current user's schedule into the time intervals.
 * This is necessary because the event data model stores only `TimeInterval[]`.
 * @param timeBlocks
 * @returns array of time intervals.
 */
export const mapScheduleToTimeIntervals = (
    timeBlocks: FilledSchedule,
    username: string,
): TimeInterval[] => {
    return [];
};

/**
 * From the given list of time intervals, extract out dates in all their days.
 * @param timeIntervals
 * @returns a set of all the dates in the time intervals.
 */
export const extractOutSelectedDays = (
    timeIntervals: TimeInterval[],
): Set<string> => {
    const allDates = timeIntervals?.reduce((currDates, interval) => {
        const dates: string[] = interval.map((day) => day.date);
        return [...currDates, ...dates];
    }, [] as string[]);
    return new Set<string>(allDates);
};

export const TIME_LABELS = [
    "12:00 AM",
    "12:30 AM",
    "1:00 AM",
    "1:30 AM",
    "2:00 AM",
    "2:30 AM",
    "3:00 AM",
    "3:30 AM",
    "4:00 AM",
    "4:30 AM",
    "5:00 AM",
    "5:30 AM",
    "6:00 AM",
    "6:30 AM",
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
];
