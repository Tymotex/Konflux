import { format } from "date-fns";
import React, { MouseEvent, useCallback, useEffect, useState } from "react";
import Calendar, { CalendarTileProperties, DateCallback } from "react-calendar";

interface Props {}

const BUTTONS_SELECTOR = `.react-calendar__month-view__days > button`;

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
            if (
                selectedDays?.some(
                    (date) => date.getTime() === thisDate.getTime(),
                )
            ) {
                setSelectedDays(
                    selectedDays.filter((date) => {
                        return date.getTime() !== thisDate.getTime();
                    }),
                );
                button.style.backgroundColor = "white";
                button.style.color = "black";
            } else {
                setSelectedDays([...selectedDays, thisDate]);
                button.style.backgroundColor = "black";
                button.style.color = "white";
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

    return (
        <div>
            <Calendar
                tileDisabled={shouldDisableTile}
                onClickDay={toggleDaySelection}
                defaultView="month"
                minDate={new Date()} // Only allow the selection of today and beyond.
                minDetail="month" // Only allow the selection of days in a month.
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
