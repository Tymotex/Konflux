import { TimeInterval } from "components/timetable/Timetable";
import { FilledSchedule } from "components/timetable/timetable-utils";
import { getDatabase, push, ref, set } from "firebase/database";
import { db } from "utils/firebaseInit";

// TODO: doc
export interface LocalEventMember {
    username: string;
    password?: string;
    email?: string;
    profilePicUrl?: string;
}

// TODO: doc
export interface KonfluxEvent {
    name: string;
    earliest: number;
    latest: number;
    days: TimeInterval[];
    members: {
        [username: string]: Omit<LocalEventMember, "username">;
    };
}

// TODO: doc
export const createEvent = (eventName: string): string => {
    const event: KonfluxEvent = {
        name: eventName,
        earliest: 18,
        latest: 34,
        days: [],
        members: {},
    };
    // TODO: error handling
    const reference = push(ref(db, `events`), event);
    if (!reference.key) throw Error("Failed to create event.");
    return reference.key;
};

// TODO: doc
export const syncEventDays = (
    eventId: string,
    timeIntervals: TimeInterval[],
): void => {
    // TODO: error handling
    set(ref(db, `events/${eventId}/days`), timeIntervals);
};

// TODO: doc
export const syncEventAvailability = (
    eventId: string,
    timeBlocks: FilledSchedule,
) => {
    // We need to convert the `FilledSchedule` data structure into type
    // `TimeInterval[]` to fit the event data model.
    //
    // set(ref(db, `events/${eventId}/`));
};
