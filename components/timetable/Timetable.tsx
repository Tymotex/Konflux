import React, { useCallback } from "react";

export interface DayAvailabilities {
    date: string;
    whoIsAvailable: string[][];
}

// Holds an array of contiguous days' availabilities.
export type TimeInterval = DayAvailabilities[];

interface Props {
    timeIntervals: TimeInterval[];
}

const Timetable: React.FC<Props> = ({ timeIntervals }) => {
    console.log(timeIntervals);
    return <div></div>;
};

export default Timetable;
