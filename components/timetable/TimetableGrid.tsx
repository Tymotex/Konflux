import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { TimeInterval } from "./Timetable";
import styles from "./Timetable.module.scss";
import advancedFormat from "dayjs/plugin/advancedFormat";

// TODO: move this to somewhere else. Should only have to run once and then never again.
dayjs.extend(advancedFormat);

interface Props {
    timeIntervals: TimeInterval[];
}

interface FilledSchedule {
    [day: string]: boolean[];
}

const TimetableGrid: React.FC<Props> = ({ timeIntervals }) => {
    const [selectedBlocks, setSelectedBlocks] = useState<FilledSchedule>({});

    console.log(selectedBlocks);

    useEffect(() => {
        // For every day in the time intervals that are not present in the
        // `selectedBlocks` data structure, put in that missing day. For the
        // days that are present in `selectedBlocks`, do nothing to prevent
        // the 'loss of progress'.
        // Note: `selectedBlocks` only grows in size.
        // TODO: having no upper bound to the size of `selectedBlocks` might be problematic for performance. This would be easily solved if we were to remove days from `selectedBlocks` that aren't in the list of time intervals.
        const newSelectedBlocks = { ...selectedBlocks };
        timeIntervals.forEach((interval) => {
            interval.forEach((day) => {
                if (!(day.date in newSelectedBlocks))
                    newSelectedBlocks[day.date] = [...Array(48)].map(
                        () => false,
                    );
            });
        });
        setSelectedBlocks(newSelectedBlocks);
    }, [timeIntervals]);

    const toggleTimeblockSelection = useCallback(
        (date: string, timeBlockIndex: number) => {
            if (!(date in selectedBlocks)) {
                // TODO: the user selected a date using invalid UI... fatal error. What to do?
                alert("Fatal error");
                return;
            }
            selectedBlocks[date][timeBlockIndex] =
                !selectedBlocks[date][timeBlockIndex];
        },
        [selectedBlocks],
    );

    const isSelected = useCallback(
        (date: string, timeBlockIndex: number): boolean => {
            if (selectedBlocks && date in selectedBlocks)
                return selectedBlocks[date][timeBlockIndex];
            return false;
        },
        [selectedBlocks],
    );

    return (
        <>
            <div className={styles.timetable}>
                <div className={styles.timeBlockLabels}>
                    {[...Array(48)].map((_, i) => (
                        <span className={styles.label}>{i}</span>
                    ))}
                </div>
                {timeIntervals.map((interval) => (
                    <div className={styles.columnGroup}>
                        {interval.map((day) => (
                            <div className={styles.column}>
                                <span className={styles.dateLabel}>
                                    {dayjs(day.date).format("Do MMM")}
                                </span>
                                {day.whoIsAvailable.map((time, i) => (
                                    <div
                                        className={`${styles.timeBlock} ${
                                            isSelected(day.date, i)
                                                ? styles.selected
                                                : styles.notSelected
                                        }`}
                                        onClick={() =>
                                            toggleTimeblockSelection(
                                                day.date,
                                                i,
                                            )
                                        }
                                        onMouseDown={(e) => {
                                            // Apply the `pressed` class to this element.
                                            const thisElem =
                                                e.target as HTMLUListElement;
                                            thisElem.classList.add(
                                                styles.pressed,
                                            );
                                        }}
                                        onMouseLeave={(e) => {
                                            // Revoke the `pressed` class from this element.
                                            const thisElem =
                                                e.target as HTMLUListElement;
                                            thisElem.classList.remove(
                                                styles.pressed,
                                            );
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

export default TimetableGrid;
