import dayjs from "dayjs";
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";
import { TimeInterval } from "./Timetable";
import styles from "./Timetable.module.scss";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { toast } from "react-toastify";
import { FilledSchedule, TIME_LABELS } from "./timetable-utils";

// TODO: move this to somewhere else. Should only have to run once and then never again.
dayjs.extend(advancedFormat);

interface Props {
    timeIntervals: TimeInterval[];
    selectedBlocks: FilledSchedule;
    setSelectedBlocks: Dispatch<SetStateAction<FilledSchedule>>;
    disabled?: boolean;
}

const TimetableGrid: React.FC<Props> = ({
    timeIntervals,
    selectedBlocks,
    setSelectedBlocks,
    disabled = false,
}) => {
    // State for tracking whether the user is selecting or deselecting a
    // rectangular area of time blocks.
    const [isSelectingArea, setIsSelectingArea] = useState<boolean>(false);
    const [isDeselectingArea, setIsDeselectingArea] = useState<boolean>(false);

    // State for tracking the rectangular area drawn by the user from one
    // time block on the grid to another.
    const [selectionStartTime, setSelectionStartTime] = useState<number>();
    const [selectionStartDate, setSelectionStartDate] = useState<string>();
    const [selectionEndTime, setSelectionEndTime] = useState<number>();
    const [selectionEndDate, setSelectionEndDate] = useState<string>();

    // For every day in the time intervals that are not present in the
    // `selectedBlocks` data structure, put in that missing day. For the
    // days that are present in `selectedBlocks`, do nothing to prevent
    // the 'loss of progress'.
    // Note: `selectedBlocks` only grows in size.
    // TODO: having no upper bound to the size of `selectedBlocks` might be problematic for performance. This would be easily solved if we were to remove days from `selectedBlocks` that aren't in the list of time intervals.
    useEffect(() => {
        const newSelectedBlocks = { ...selectedBlocks };
        let mutated = false;
        timeIntervals.forEach((interval) => {
            interval.forEach((day) => {
                if (!(day.date in newSelectedBlocks)) {
                    mutated = true;
                    newSelectedBlocks[day.date] = [...Array(48)].map(
                        () => false,
                    );
                }
            });
        });
        if (mutated) setSelectedBlocks(newSelectedBlocks);
    }, [timeIntervals, selectedBlocks, setSelectedBlocks]);

    // Resets all range-tracking variables. Should be called after committing or
    // aborting a range selection/deselection.
    const resetRangeTrackingState = useCallback(() => {
        setIsSelectingArea(false);
        setIsDeselectingArea(false);
        setSelectionStartDate("");
        setSelectionStartTime(undefined);
        setSelectionEndDate("");
        setSelectionEndTime(undefined);
    }, []);

    // When the user is selecting an area and lifts up their finger anywhere on
    // the <body>, add the selected time blocks to the `selectedBlocks`.
    // When the user's mouse exits the <body>, just abort the selection.
    // When the user is deselecting, we go by the same logic as above, except we
    // remove time blocks from `selectedBlocks` instead of adding.
    useEffect(() => {
        // Commits the time blocks in the selected area into `selectedBlocks`.
        const commitAreaSelection = () => {
            // Iterate through each time block within the rectangular are
            // defined by the start time/date and end time/date.
            // TODO: this bound validity checking logic is duplicated (I think).
            if (
                selectionStartTime === undefined ||
                selectionEndTime === undefined ||
                !selectionStartDate ||
                !selectionEndDate
            ) {
                // TODO: fatal error. what do?
                // toast.error("Rectangular bounds not correctly set");
                return;
            }
            const startRow =
                selectionStartTime <= selectionEndTime
                    ? selectionStartTime
                    : selectionEndTime;
            const endRow =
                selectionStartTime <= selectionEndTime
                    ? selectionEndTime
                    : selectionStartTime;
            const startCol =
                selectionStartDate <= selectionEndDate
                    ? selectionStartDate
                    : selectionEndDate;
            const endCol =
                selectionStartDate <= selectionEndDate
                    ? selectionEndDate
                    : selectionStartDate;

            const newSelectedBlocks = { ...selectedBlocks };
            console.log(
                `Looping from timeBlockIndex=${selectionStartTime} to ${selectionEndTime}`,
            );
            for (
                let timeBlockIndex = startRow;
                timeBlockIndex <= endRow;
                ++timeBlockIndex
            ) {
                let currDate = startCol;
                console.log(`Curr date=${currDate}, going to ${endCol}`);
                while (currDate <= endCol) {
                    // It's possible for the current date to not exist in the
                    // `selectedBlocks` map because of discontinuity in the
                    // selected days. In this case, we simply skip.
                    if (!(currDate in newSelectedBlocks)) {
                        currDate = dayjs(currDate)
                            .add(1, "day")
                            .format("YYYY-MM-DD");
                        continue;
                    }

                    // Add or remove the current timeblock in the rectangular
                    // area depending on if we're selecting or deselecting.
                    if (isSelectingArea)
                        newSelectedBlocks[currDate][timeBlockIndex] = true;
                    else if (isDeselectingArea)
                        newSelectedBlocks[currDate][timeBlockIndex] = false;
                    else {
                        // TODO: fatal err. What do?
                        toast.error("Neither selecting nor deselecting...");
                        resetRangeTrackingState();
                        return;
                    }
                    currDate = dayjs(currDate)
                        .add(1, "day")
                        .format("YYYY-MM-DD");
                }
            }
            setSelectedBlocks(newSelectedBlocks);
            resetRangeTrackingState();
        };

        // Cancel the area selection/deselection by doing nothing and resetting
        // the range-tracking state.
        const abortAreaSelection = () => {
            if (isSelectingArea || isDeselectingArea)
                toast.warning("Aborted selection");
            resetRangeTrackingState();
        };

        // Attaching commit/abort functions as handlers to the document body.
        // We're attaching the mouse events on the body instead of on the
        // timetable UI since this allows the user to be less precise with their
        // mouse movement (when they let go of the click outside the timetable
        // instead of inside it).
        const body = document.querySelector("body");
        if (!body) {
            toast.error("Fatal error. Document body not found");
            return;
        }
        body.addEventListener("mouseup", commitAreaSelection);
        body.addEventListener("mouseleave", abortAreaSelection);
        return () => {
            body.removeEventListener("mouseup", commitAreaSelection);
            body.removeEventListener("mouseleave", abortAreaSelection);
        };
    }, [
        selectedBlocks,
        setSelectedBlocks,
        setIsSelectingArea,
        setIsDeselectingArea,
        isSelectingArea,
        isDeselectingArea,
        resetRangeTrackingState,
        selectionStartDate,
        selectionStartTime,
        selectionEndDate,
        selectionEndTime,
    ]);

    // TODO: doc
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

    // TODO: doc
    const isSelected = useCallback(
        (date: string, timeBlockIndex: number): boolean => {
            if (selectedBlocks && date in selectedBlocks)
                return selectedBlocks[date][timeBlockIndex];
            return false;
        },
        [selectedBlocks],
    );

    // TODO: doc
    const beginSelectingArea = useCallback(
        (date: string, timeBlockIndex: number) => {
            if (!isSelected(date, timeBlockIndex)) setIsSelectingArea(true);
            else setIsDeselectingArea(true);

            setSelectionStartTime(timeBlockIndex);
            setSelectionStartDate(date);
        },
        [isSelected],
    );

    // Determines whether the given time block is in the selection/deselection
    // rectangular area drawn from:
    //   starting row: `selectionStartTime`
    //   starting col: `selectionStartDate`
    //   ending row:   `selectionEndTime`
    //   ending col:   `selectionEndTime`
    const isInAreaSelection = useCallback(
        (date: string, timeBlockIndex: number) => {
            if (
                !(
                    selectionStartTime !== undefined &&
                    selectionStartDate &&
                    selectionEndTime !== undefined &&
                    selectionEndDate
                )
            ) {
                return false;
            }

            const startRow =
                selectionStartTime <= selectionEndTime
                    ? selectionStartTime
                    : selectionEndTime;
            const endRow =
                selectionStartTime <= selectionEndTime
                    ? selectionEndTime
                    : selectionStartTime;
            const startCol =
                selectionStartDate <= selectionEndDate
                    ? selectionStartDate
                    : selectionEndDate;
            const endCol =
                selectionStartDate <= selectionEndDate
                    ? selectionEndDate
                    : selectionStartDate;

            return (
                startRow <= timeBlockIndex &&
                timeBlockIndex <= endRow &&
                startCol <= date &&
                date <= endCol
            );
        },
        [
            selectionStartTime,
            selectionStartDate,
            selectionEndTime,
            selectionEndDate,
        ],
    );

    // When the user's mouse leaves a time block while still holding the left
    // mouse button, begin selecting/deselecting an area of blocks.
    const handleMouseLeave = useCallback(
        (e: React.MouseEvent, date: string, timeBlockIndex: number) => {
            const isLeftClicking = e.buttons === 1;
            const notTrackingAreaSelection = !(
                isSelectingArea || isDeselectingArea
            );
            if (isLeftClicking && notTrackingAreaSelection)
                beginSelectingArea(date, timeBlockIndex);
        },
        [isSelectingArea, isDeselectingArea, beginSelectingArea],
    );

    return (
        <>
            {/* <pre>Selecting area? {isSelectingArea ? "YES" : "NO"}</pre>
            <pre>Deselect area? {isDeselectingArea ? "YES" : "NO"}</pre>
            <pre>Start time? {selectionStartTime}</pre>
            <pre>Start date? {selectionStartDate}</pre>
            <pre>End time? {selectionEndTime}</pre>
            <pre>End date? {selectionEndDate}</pre> */}
            <div
                className={`${styles.timetable} ${disabled && styles.disabled}`}
            >
                <div className={styles.timeBlockLabels}>
                    {TIME_LABELS.map((label) => (
                        <span key={label} className={styles.label}>
                            {label}
                        </span>
                    ))}
                </div>
                {timeIntervals.map((interval, i) => (
                    <div key={i} className={styles.columnGroup}>
                        {interval.map((day) => (
                            <div key={day.date} className={styles.column}>
                                <span className={styles.dateLabel}>
                                    {dayjs(day.date).format("Do MMM")}
                                </span>
                                {day.whoIsAvailable.map(
                                    (peopleAvailable, i) => (
                                        <div
                                            key={i}
                                            className={`${styles.timeBlock} ${
                                                isSelected(day.date, i)
                                                    ? styles.selected
                                                    : styles.notSelected
                                            } ${
                                                isInAreaSelection(day.date, i)
                                                    ? styles.inSelectedArea
                                                    : ""
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
                                                handleMouseLeave(
                                                    e,
                                                    day.date,
                                                    i,
                                                );
                                            }}
                                            onMouseEnter={() => {
                                                setSelectionEndTime(i);
                                                setSelectionEndDate(day.date);
                                            }}
                                        >
                                            {peopleAvailable.map((person) => (
                                                <>{person[0]},</>
                                            ))}
                                        </div>
                                    ),
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

export default TimetableGrid;
