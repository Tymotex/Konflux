import { createIntervals } from "components/timetable/timetable-utils";

describe("Timetable utility tests", () => {
    test("Single day into 1 interval", () => {
        const daySet = new Set<string>(["2022-01-20"]);
        const intervals = createIntervals(daySet);
        expect(intervals).toHaveLength(1);
        expect(intervals[0]).toMatchObject([
            {
                date: "2022-01-20",
            },
        ]);
        expect(intervals[0][0].whoIsAvailable).toHaveLength(48);
    });
    test("Merges into 2 intervals.", () => {
        const daySet = new Set<string>([
            "2022-08-03",
            "2022-08-04",
            "2022-08-06",
        ]);
        const intervals = createIntervals(daySet);
        expect(intervals).toHaveLength(2);
        expect(intervals[0]).toMatchObject([
            {
                date: "2022-08-03",
            },
            {
                date: "2022-08-04",
            },
        ]);
        expect(intervals[1]).toMatchObject([
            {
                date: "2022-08-06",
            },
        ]);
    });
    test("Merges multiple days into multiple intervals", () => {
        const daySet = new Set<string>([
            "2022-08-03", // Interval 1.
            "2022-08-04", // Interval 1.
            "2022-08-06", // Interval 2.
            "2022-08-07", // Interval 2.
            "2022-08-08", // Interval 2.
            "2022-08-09", // Interval 2.
            "2022-08-31", // Interval 3.
            "2022-09-01", // Interval 3.
            "2022-09-03", // Interval 4.
        ]);
        const intervals = createIntervals(daySet);
        expect(intervals).toHaveLength(4);
        expect(intervals[0]).toMatchObject([
            {
                date: "2022-08-03",
            },
            {
                date: "2022-08-04",
            },
        ]);
        expect(intervals[1]).toMatchObject([
            {
                date: "2022-08-06",
            },
            {
                date: "2022-08-07",
            },
            {
                date: "2022-08-08",
            },
            {
                date: "2022-08-09",
            },
        ]);
        expect(intervals[2]).toMatchObject([
            {
                date: "2022-08-31",
            },
            {
                date: "2022-09-01",
            },
        ]);
        expect(intervals[3]).toMatchObject([{ date: "2022-09-03" }]);
    });
});
