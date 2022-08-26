import dayjs from "dayjs";
import { KonfluxEvent } from "models/event";
import { TimeInterval } from "./Timetable";

// A single person's availabilities. This is meant to be used by the timetable
// for filling out availabilities, not for showing the group's availabilities.
export type IndividualAvailabilities = boolean[];

/**
 * From the map `selectedDays` containing universal ISO string dates as keys,
 * create a sorted array of intervals containing contiguous days.
 *
 * Example:
 *   Suppose `selectedDays` is["2022-08-03", "2022-08-04", "2022-08-07"].
 *   This function is expected to return:
 *     [
 *       [{ date: "2022-08-03" }, { date: "2022-08-04" }],
 *       [{ date: "2022-08-07" }]
 *     ]
 *
 * @param selectedDays
 * @returns
 * Sorted array of arrays of contiguous time intervals.
 */
export const createIntervals = (
    selectedDays: KonfluxEvent["groupAvailabilities"],
): TimeInterval[] => {
    if (!selectedDays) return [];
    const days = Object.keys(selectedDays).sort();

    const contiguousDays: TimeInterval[] = [];
    let prevDay = "";
    days.forEach((date) => {
        // Use the first day to create the first interval.
        if (!prevDay) {
            prevDay = date;
            contiguousDays.push([date]);
            return;
        }
        // If the current day is 1 day ahead of the previous day, then
        // merge it in the same interval, otherwise start a new one.
        if (dayjs(date).subtract(1, "day").format("YYYY-MM-DD") === prevDay) {
            contiguousDays[contiguousDays.length - 1].push(date);
        } else {
            contiguousDays.push([date]);
        }
        prevDay = date;
    });

    return contiguousDays;
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
