import { useEffect, useState } from "react";
import { getEventsFromLocalStorage } from "utils/local-events-list";

export type LocalStorageEventData = { id: string; name: string };

export const useLocalStorageEvents = () => {
    const [events, setEvents] = useState<LocalStorageEventData[]>([]);

    useEffect(() => {
        const eventsDict = getEventsFromLocalStorage();
        const events = Object.keys(eventsDict || {}).map((eventId) => ({
            id: eventId,
            ...eventsDict[eventId],
        }));
        setEvents(events);
    }, []);

    return events;
};
