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
export type AvailabilityInfo = {
    [timeBlockIndex: number]: {
        [username: string]: {
            // A very annoying detail about Firebase is that you cannot store empty
            // objects or arrays. The officially suggested workaround is to put in
            // a placeholder value.
            // See: https://groups.google.com/g/firebase-talk/c/fdjqrn93OcY/m/-Tml0ifSiV4J?pli=1.
            placeholder?: boolean;
            // Data about this availability.
            // To be determined in the next iteration.
        };
    };
    placeholder?: true;
};

// TODO: doc
export interface KonfluxEvent {
    name: string;
    earliest: number;
    latest: number;
    groupAvailabilities: {
        [date: string]: AvailabilityInfo;
    };
    members: {
        [username: string]: Omit<LocalEventMember, "username">;
    };
}

export const EMPTY_EVENT = {
    name: "",
    earliest: 0,
    latest: 48,
    groupAvailabilities: {},
    members: {},
};

// TODO: doc
export const createEvent = (
    eventName: string,
    creatorUsername: string,
): string => {
    const event: KonfluxEvent = {
        name: eventName,
        earliest: 18,
        latest: 34,
        groupAvailabilities: {},
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
export const updateRemoteAvailabilities = (
    eventId: string,
    availabilities: KonfluxEvent["groupAvailabilities"],
): void => {
    // TODO: error handling
    set(
        ref(getDatabase(), `events/${eventId}/groupAvailabilities`),
        availabilities,
    );
};
