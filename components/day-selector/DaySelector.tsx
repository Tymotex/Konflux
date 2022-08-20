import { format } from "date-fns";
import React, { MouseEvent, useCallback, useEffect, useState } from "react";
import Calendar, { CalendarTileProperties, DateCallback } from "react-calendar";
import { toast } from "react-toastify";

interface Props {}

// TODO: Move these constants elsewhere?
const BUTTONS_SELECTOR = `.react-calendar__month-view__days > button`;
const MAX_DAYS_SELECTABLE = 5;

// TODO: Refactor this
const applySelectedDayStyles = (button: HTMLButtonElement) => {
    button.style.backgroundColor = "black";
    button.style.color = "white";
};
const removeSelectedDayStyles = (button: HTMLButtonElement) => {
    button.style.backgroundColor = "white";
    button.style.color = "black";
};

const DaySelector: React.FC<Props> = () => {
    // A sorted array of the days that have been selected.
    const [selectedDays, setSelectedDays] = useState<Date[]>([]);

    // Debug. TODO: remove.
    useEffect(() => {
        console.log("Selected days: ", selectedDays);
    }, [selectedDays]);

    // Make all <abbr> elements unclickable. This is to prevent the <abbr>
    // elements under each button from being assigned as the `event.target` when
    // the button containing it is clicked.
    useEffect(() => {
        const dateAbbr = Array.from(
            document.querySelectorAll(
                `${BUTTONS_SELECTOR} > abbr`,
            ) as NodeListOf<HTMLElement>,
        );
        dateAbbr.forEach((abbr) => (abbr.style.pointerEvents = "none"));
    }, []);

    // Toggles the selection of the given day.
    const toggleDaySelection = useCallback<DateCallback>(
        (thisDate: Date, event: MouseEvent<HTMLButtonElement>) => {
            const button = event.target as HTMLButtonElement;
            const alreadySelected = selectedDays?.some(
                (date) => date.getTime() === thisDate.getTime(),
            );

            if (alreadySelected) {
                setSelectedDays(
                    selectedDays.filter((date) => {
                        return date.getTime() !== thisDate.getTime();
                    }),
                );
                removeSelectedDayStyles(button);
            } else {
                if (selectedDays?.length >= MAX_DAYS_SELECTABLE) {
                    toast.error(
                        `You can only select ${MAX_DAYS_SELECTABLE} days at most.`,
                    );
                    return;
                }
                setSelectedDays([...selectedDays, thisDate]);
                applySelectedDayStyles(button);
            }
        },
        [selectedDays],
    );

    // A predicate function determining whether a tile in the calendar should be
    // disabled.
    const shouldDisableTile = useCallback((props: CalendarTileProperties) => {
        const { date } = props;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date <= yesterday;
    }, []);

    const handleOnViewChange = useCallback(() => {
        // When switching months, we need to refresh the view by reapplying the
        // 'selected day' CSS class to all the selected days in the current
        // view's month.
        const dateBtns = Array.from(
            document.querySelectorAll(
                BUTTONS_SELECTOR,
            ) as NodeListOf<HTMLButtonElement>,
        );
        alert("Refreshing");
        dateBtns.forEach((dateBtn) => {
            // Every date button as an <abbr>. We can grab the date from its
            // `aria-label`.
            const abbr = dateBtn.querySelector("abbr");
            if (!abbr) {
                // TODO: it's a fatal error if abbr doesn't exist. What to do?
                throw Error("Expected abbr");
            }

            // TODO: it's a fatal error if aria-label has no date. What to do?
            if (abbr.getAttribute("aria-label") === null) {
                throw Error("Expected aria-label");
            }
            const dateVal = new Date(String(abbr.getAttribute("aria-label")));

            // If this date selected, then apply selected day styles to it.
            selectedDays.some((day) => {
                if (day.getTime() === dateVal.getTime()) {
                    applySelectedDayStyles(dateBtn);
                    return true;
                }
            });
        });
    }, [selectedDays]);

    return (
        <div>
            <Calendar
                tileDisabled={shouldDisableTile}
                onClickDay={toggleDaySelection}
                defaultView="month"
                minDate={new Date()} // Only allow the selection of today and beyond.
                minDetail="month" // Only allow the selection of days in a month.
                showNeighboringMonth={false}
                // onViewChange={handleOnViewChange}
            />

            <ul>
                {selectedDays?.map((day) => (
                    <li key={String(day)}>{format(day, "do MMM (eeee)")}</li>
                ))}
            </ul>
        </div>
    );
};

export default DaySelector;
