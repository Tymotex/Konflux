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
    if (leader.scrollWidth !== follower.scrollWidth) {
        // throw new Error(
        //     `Mismatched widths between leader and follower element (leader=${leader.scrollWidth} and follower=${follower.scrollWidth})`,
        // );
        return;
    }
    follower.scrollTo(leader.scrollLeft, leader.scrollTop);
};
