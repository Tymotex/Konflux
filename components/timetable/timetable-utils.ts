import {
    getNextDate,
    getNumberOfDaysInMonth,
} from "components/day-selector/calendar-utils";
import dayjs from "dayjs";
import { KonfluxEvent } from "models/event";

/** Holds an array of contiguous dates. */
export type TimeInterval = string[];

const UNIVERSAL_ISO_PATTERN = /(\d{4})-(\d{1,2})-(\d{1,2})/;

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

/**
 * Returns an object containing the starting row and col and ending row and col
 * from the given 2 time and date pairs. This is to help the caller skip the
 * need to order them correctly.
 * Assumes that the given times and dates are valid!
 * @param time1
 * @param time2
 * @param date1
 * @param date2
 * @returns
 */
export const getStartAndEndRowsAndCols = (
    time1: number | undefined,
    time2: number | undefined,
    date1: string | undefined,
    date2: string | undefined,
) => {
    if (time1 === undefined || time2 === undefined || !date1 || !date2)
        throw new Error(
            "Can't determine start and end rows and cols from invalid bounds.",
        );
    const timeCmp = time1 <= time2;
    const dateCmp = date1 <= date2;
    return {
        startRow: timeCmp ? time1 : time2,
        endRow: timeCmp ? time2 : time1,
        startCol: dateCmp ? date1 : date2,
        endCol: dateCmp ? date2 : date1,
    };
};

/**
 * Determines whether the given times and dates are valid.
 * @param time1
 * @param time2
 * @param date1
 * @param date2
 * @returns
 */
export const boundsAreValid = (
    time1: number | undefined,
    time2: number | undefined,
    date1: string | undefined,
    date2: string | undefined,
    maxRows: number,
) => {
    return (
        time1 !== undefined &&
        time1 >= 0 &&
        time2 !== undefined &&
        time2 < maxRows &&
        date1 &&
        isUniversalIsoFormat(date1) &&
        date2 &&
        isUniversalIsoFormat(date2)
    );
};

/**
 * Determines whether the given string adheres to the universal ISO date format,
 * 'YYYY-MM-DD' and contains a valid year, month and day.
 * @param date
 * @returns
 */
export const isUniversalIsoFormat = (date: string): boolean => {
    if (!date) return false;

    const matches = UNIVERSAL_ISO_PATTERN.exec(date);
    if (!matches) return false;

    const year = Number(matches[1]);
    const month = Number(matches[2]);
    const day = Number(matches[3]);

    return (
        year >= 0 &&
        year <= 9999 &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= getNumberOfDaysInMonth(String(year), String(month))
    );
};

/**
 * Creates a new availabilities data object based on the current availabilities
 * and the rectangular area drawn by the time1/time2/date1/date2 bounds.
 * If the user is selecting, then new time blocks are marked with their
 * username, otherwise if they're deselecting, then their username is removed
 * from time blocks.
 * @param availabilities the current availabilities
 * @param username the name of the user drawing the selection
 * @param time1 first time bound (not necessarily earlier than `time2`)
 * @param time2 second time bound
 * @param date1 first date bound (not necessarily earlier than `date2`)
 * @param date2 second date bound
 * @param isSelecting
 * @param isDeselecting
 * @returns new availabilities object.
 */
export const createNewAvailabilitiesAfterSelection = (
    availabilities: KonfluxEvent["groupAvailabilities"],
    username: string,
    time1: number | undefined,
    time2: number | undefined,
    date1: string | undefined,
    date2: string | undefined,
    earliestTimeIndex: number,
    maxRows: number,
    isSelecting: boolean,
    isDeselecting: boolean,
): KonfluxEvent["groupAvailabilities"] => {
    if (!boundsAreValid(time1, time2, date1, date2, maxRows))
        throw new Error("Can't commit area selection due to invalid bounds.");
    if (isSelecting && isDeselecting)
        throw new Error(
            "Invalid state: selecting and deselecting at the same time.",
        );
    if (!isSelecting && !isDeselecting)
        throw new Error("Neither selecting nor deselecting.");

    // Iterate through each time block within the rectangular are
    // defined by the start time/date and end time/date.
    const { startRow, endRow, startCol, endCol } = getStartAndEndRowsAndCols(
        time1,
        time2,
        date1,
        date2,
    );

    const newAvailabilities = { ...availabilities };
    for (
        let timeBlockIndex = startRow;
        timeBlockIndex <= endRow;
        ++timeBlockIndex
    ) {
        let currDate = startCol;
        while (currDate <= endCol) {
            // It's possible for the current date to not exist in the
            // `selectedBlocks` map because of discontinuity in the
            // selected days. In this case, we simply skip.
            if (!(currDate in newAvailabilities)) {
                currDate = getNextDate(currDate);
                continue;
            }

            // Add or remove the current timeblock in the rectangular
            // area depending on if we're selecting or deselecting.
            const timeBlock =
                newAvailabilities[currDate][timeBlockIndex + earliestTimeIndex];
            if (isSelecting)
                newAvailabilities[currDate][
                    timeBlockIndex + earliestTimeIndex
                ] = {
                    ...timeBlock,
                    [username]: { placeholder: true },
                };
            else if (isDeselecting) {
                if (timeBlock && username in timeBlock)
                    delete newAvailabilities[currDate][
                        timeBlockIndex + earliestTimeIndex
                    ][username];
            } else {
                throw new Error(
                    "Neither selecting nor deselecting. Please try again.",
                );
            }
            currDate = getNextDate(currDate);
        }
    }
    return newAvailabilities;
};

// A list of all time labels for the time blocks of the timetable.
export const TIME_LABELS = [
    "12:00 am",
    "12:30 am",
    "1:00 am",
    "1:30 am",
    "2:00 am",
    "2:30 am",
    "3:00 am",
    "3:30 am",
    "4:00 am",
    "4:30 am",
    "5:00 am",
    "5:30 am",
    "6:00 am",
    "6:30 am",
    "7:00 am",
    "7:30 am",
    "8:00 am",
    "8:30 am",
    "9:00 am",
    "9:30 am",
    "10:00 am",
    "10:30 am",
    "11:00 am",
    "11:30 am",
    "12:00 pm",
    "12:30 pm",
    "1:00 pm",
    "1:30 pm",
    "2:00 pm",
    "2:30 pm",
    "3:00 pm",
    "3:30 pm",
    "4:00 pm",
    "4:30 pm",
    "5:00 pm",
    "5:30 pm",
    "6:00 pm",
    "6:30 pm",
    "7:00 pm",
    "7:30 pm",
    "8:00 pm",
    "8:30 pm",
    "9:00 pm",
    "9:30 pm",
    "10:00 pm",
    "10:30 pm",
    "11:00 pm",
    "11:30 pm",
    "12:00 am",
];
