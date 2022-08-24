import React, { Dispatch, SetStateAction, useCallback } from "react";
import EventSignIn from "./EventSignIn";
import { FilledSchedule } from "./timetable-utils";
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
    selectedBlocks: FilledSchedule;
    setSelectedBlocks: Dispatch<SetStateAction<FilledSchedule>>;
}

const Timetable: React.FC<Props> = ({
    timeIntervals,
    selectedBlocks,
    setSelectedBlocks,
}) => {
    return (
        <>
            <EventSignIn />
            <TimetableGrid
                // disabled
                timeIntervals={timeIntervals}
                selectedBlocks={selectedBlocks}
                setSelectedBlocks={setSelectedBlocks}
            />
        </>
    );
};

export default Timetable;
