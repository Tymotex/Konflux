import React, { useCallback } from "react";
import styles from "./Timetable.module.scss";
import TimetableGrid from "./TimetableGrid";

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
    return (
        <>
            <TimetableGrid timeIntervals={timeIntervals} />
        </>
    );
};

export default Timetable;
