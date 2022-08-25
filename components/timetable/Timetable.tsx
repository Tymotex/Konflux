import React, { Dispatch, SetStateAction, useCallback } from "react";
import EventSignIn from "./EventSignIn";
import { FilledSchedule } from "./timetable-utils";
import styles from "./Timetable.module.scss";
import TimetableGrid from "./TimetableGrid";

export interface DayAvailabilities {
    date: string;
    groupAvailabilities: string[][];
}

// Holds an array of contiguous days' availabilities.
export type TimeInterval = DayAvailabilities[];

interface Props {
    timeIntervals: TimeInterval[];
    selectedBlocks: FilledSchedule;
    onChange: (newSelectedBlocks: FilledSchedule) => void;
    showGroupAvailability?: boolean;
}

const Timetable: React.FC<Props> = ({
    timeIntervals,
    selectedBlocks,
    showGroupAvailability = false,
    onChange,
}) => {
    return (
        <>
            <EventSignIn />
            <TimetableGrid
                // disabled
                timeIntervals={timeIntervals}
                selectedBlocks={selectedBlocks}
                onChange={onChange}
            />
        </>
    );
};

export default Timetable;
