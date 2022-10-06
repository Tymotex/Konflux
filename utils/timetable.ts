import { TIME_LABELS } from "components/timetable/timetable-utils";
import { KonfluxEvent } from "models/event";

/**
 * Calculates the height that the information/utilities header component on top
 * of the dual timetables. They should match so that the two timetables are
 * aligned with each other.
 * @returns height that the header should be.
 */
export const getHeaderHeight = (): string => {
    const individualTimetable = document.getElementById(
        "individual-timetable-header",
    );
    const groupTimetable = document.getElementById("group-timetable-header");
    if (!individualTimetable || !groupTimetable) return "0px";

    const targetHeight = Math.max(
        individualTimetable.offsetHeight,
        groupTimetable.offsetHeight,
    );
    return String(targetHeight + "px");
};

/**
 * Syncs the horizontal scroll position of the follower to the leader element.
 * Assumes that they're the same width.
 * @param leader
 * @param follower
 */
export const syncHorizontalScroll = (leader: Element, follower: Element) => {
    // if (leader.scrollWidth !== follower.scrollWidth) {
    //     // throw new Error(
    //     //     `Mismatched widths between leader and follower element (leader=${leader.scrollWidth} and follower=${follower.scrollWidth})`,
    //     // );
    //     return;
    // }
    follower.scrollTo(leader.scrollLeft, leader.scrollTop);
};

export const getPeopleAvailable = (
    eventState: KonfluxEvent,
    date: string,
    timeBlockIndex: number,
): string[] => {
    return Object.keys(
        eventState.groupAvailabilities[date][
            timeBlockIndex + eventState.earliest
        ] || {},
    );
};

/**
 * Returns a formatted string from the starting time corresponding to the given
 * `timeBlockIndex` over `span` time blocks.
 * For example, if eventState.earliest = 18, timeBlockIndex = 2 and span = 1,
 * then this function returns: '11:00 am → 11:30 am'.
 * @param eventState
 * @param timeBlockIndex
 * @param span
 * @returns
 */
export const getDisplayTime = (
    eventState: KonfluxEvent,
    timeBlockIndex: number,
    span: number = 1,
): string => {
    if (timeBlockIndex < 0 || timeBlockIndex >= TIME_LABELS.length) return "";
    if (timeBlockIndex + span >= TIME_LABELS.length)
        return `${TIME_LABELS[timeBlockIndex + eventState.earliest]} → ${
            TIME_LABELS[TIME_LABELS.length - 1]
        }`;
    return `${TIME_LABELS[timeBlockIndex + eventState.earliest]} → ${
        TIME_LABELS[timeBlockIndex + eventState.earliest + span]
    }`;
};
