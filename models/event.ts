import { TimeInterval } from "components/timetable/Timetable";
import {
    FilledSchedule,
    mapScheduleToTimeIntervals,
} from "components/timetable/timetable-utils";
import { getDatabase, push, ref, set } from "firebase/database";

// TODO doc
export interface LocalEventMember {
    username: string;
    password?: string;
    email?: string;
    profilePicUrl?: string;
    isOwner?: boolean;
}

// TODO: doc
export interface KonfluxEvent {
    name: string;
    earliest: number;
    latest: number;
    timeIntervals: TimeInterval[];
    members: {
        [username: string]: Omit<LocalEventMember, "username">;
    };
}

// TODO: doc
export const createEvent = (
    eventName: string,
    creatorUsername: string,
): string => {
    const event: KonfluxEvent = {
        name: eventName,
        earliest: 18,
        latest: 34,
        timeIntervals: [],
        members: {
            [creatorUsername]: {
                isOwner: true,
            },
        },
    };
    // TODO: error handling
    const reference = push(ref(getDatabase(), `events`), event);
    if (!reference.key) throw Error("Failed to create event.");
    return reference.key;
};

// TODO: doc
export const syncEventDays = (
    eventId: string,
    timeIntervals: TimeInterval[],
): void => {
    // TODO: error handling
    set(ref(getDatabase(), `events/${eventId}/timeIntervals`), timeIntervals);
};

// TODO: doc
export const syncEventAvailability = (
    eventId: string,
    timeBlocks: FilledSchedule,
    username: string,
) => {
    // We need to convert the `FilledSchedule` data structure into type
    // `TimeInterval[]` to fit the event data model.
    if (!username) {
        throw Error(
            "A non-empty username must be associated with the given schedule.",
        );
    }
    // const timeIntervals = mapScheduleToTimeIntervals(timeBlocks, username);

    // set(ref(getDatabase(), `events/${eventId}/timeIntervals`), timeIntervals);
};
