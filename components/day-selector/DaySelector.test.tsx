import DaySelector from "./DaySelector";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getNumberOfDaysInMonth } from "./calendar-utils";
import dayjs from "dayjs";

const eventId = "";
const EMPTY_EVENT = {
    name: "",
    earliest: 18,
    latest: 34,
    groupAvailabilities: {},
    members: {},
};

const mockDispatch = jest.fn((action: any) => {});

const waitForClickToRegister = async () => {
    await new Promise((r) => setTimeout(r, 100));
};

describe("Day selector tests", () => {
    let initYear = "2022";
    let initMonth = "07";

    beforeEach(() => {
        render(
            <DaySelector
                eventId={eventId}
                initYear={initYear}
                initMonth={initMonth}
                eventState={EMPTY_EVENT}
                eventDispatch={mockDispatch}
            />,
        );
    });

    test(`Renders the expected days of the current month (ignoring leading and
        trailing days of the previous month and next month)`, () => {
        for (
            let day = 1;
            day <= getNumberOfDaysInMonth(initYear, initMonth);
            day++
        ) {
            const dateBlock = screen.getByTestId(
                `date-${initYear}-${initMonth}-${String(day).padStart(2, "0")}`,
            );
            expect(dateBlock).toBeInTheDocument();
        }
    });

    test("Clicking on a date block toggles its selection", async () => {
        const dateBlock = screen.getByTestId(
            `date-${initYear}-${initMonth}-01`,
        );
        expect(dateBlock).toBeInTheDocument();

        userEvent.click(dateBlock);
        await waitForClickToRegister();

        expect(mockDispatch.mock.calls.length).toBe(1);
        expect(mockDispatch.mock.calls[0][0]).toMatchObject({
            type: "SET_AVAILABILITIES",
        });
    });

    test("Clicking on the previous month button renders the days of the previous month", async () => {
        const prevMonthBtn = screen.getByTestId("prev-month");
        userEvent.click(prevMonthBtn);
        await waitForClickToRegister();

        const prevMonth = String((Number(initMonth) - 1) % 12).padStart(2, "0");
        const prevMonthYear =
            initMonth === "01" ? String(Number(initYear) - 1) : initYear;
        for (
            let day = 1;
            day <= getNumberOfDaysInMonth(prevMonthYear, prevMonth);
            day++
        ) {
            const dateBlock = screen.getByTestId(
                `date-${prevMonthYear}-${prevMonth}-${String(day).padStart(
                    2,
                    "0",
                )}`,
            );
            expect(dateBlock).toBeInTheDocument();
        }
    });

    test("Clicking on the next month button renders the days of the next month", async () => {
        const nextMonthBtn = screen.getByTestId("next-month");
        userEvent.click(nextMonthBtn);
        await waitForClickToRegister();

        const nextMonth = String((Number(initMonth) + 1) % 12).padStart(2, "0");
        const nextMonthYear =
            initMonth === "12" ? String(Number(initYear) + 1) : initYear;
        for (
            let day = 1;
            day <= getNumberOfDaysInMonth(nextMonthYear, nextMonth);
            day++
        ) {
            const dateBlock = screen.getByTestId(
                `date-${nextMonthYear}-${nextMonth}-${String(day).padStart(
                    2,
                    "0",
                )}`,
            );
            expect(dateBlock).toBeInTheDocument();
        }
    });
});
