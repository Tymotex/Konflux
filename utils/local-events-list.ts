import { KonfluxEvent } from "models/event";

interface LocalStorageEvent {
    name: string;
}

interface LocalStorageEventDict {
    [id: string]: LocalStorageEvent;
}

export const upsertEventToLocalStorage = (
    eventId: string,
    eventName: string,
) => {
    const existingEventsDict = getEventsFromLocalStorage();
    const newEvent: LocalStorageEvent = {
        name: eventName,
    };

    const newEventsDict: LocalStorageEventDict = {
        ...existingEventsDict,
    };
    newEventsDict[eventId] = newEvent;

    localStorage.setItem("events", JSON.stringify(newEventsDict));
};

export const removeEventFromLocalStorage = (eventId: string) => {
    const existingEventsDict = getEventsFromLocalStorage();
    const newEventsDict = {
        ...existingEventsDict,
    };
    if (eventId in newEventsDict) delete newEventsDict[eventId];

    localStorage.setItem("events", JSON.stringify(newEventsDict));
};

export const getEventsFromLocalStorage = (): LocalStorageEventDict => {
    const stringifiedEventsDict = localStorage.getItem("events");
    if (!stringifiedEventsDict) return {};

    const eventsDict = JSON.parse(
        stringifiedEventsDict,
    ) as LocalStorageEventDict;

    return eventsDict;
};
