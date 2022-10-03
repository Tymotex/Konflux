/**
 * Calculates the height that the information/utilities header component on top
 * of the dual timetables. They should match so that the two timetables are
 * aligned with each other.
 * @returns height that the header should be.
 */
export const syncHeaderHeight = () => {
    const individualTimetable = document.getElementById("individual-timetable");
    const groupTimetable = document.getElementById("group-timetable");
    if (!individualTimetable || !groupTimetable) return;

    const targetHeight = Math.max(
        individualTimetable.offsetHeight,
        groupTimetable.offsetHeight,
    );
    return targetHeight;
};
