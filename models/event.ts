import { getDatabase, onValue, push, ref, set } from "firebase/database";

/**
 * Member details, but localised entirely to the event data object it is
 * associated with.
 */
export interface LocalEventMember {
    username: string;
    password?: string;
    email?: string;
    profilePicUrl?: string;
    isOwner?: boolean;
}

/**
 * A map of time block indices to the people available at them.
 * Eg. { 0: { "Tim" }} indicates that "Tim" is available at 12:00AM.
 */
export type AvailabilityInfo = {
    [timeBlockIndex: number]: {
        [username: string]: {
            /** A very annoying detail about Firebase is that you cannot store 
                empty objects or arrays. The officially suggested workaround is
                to put in a placeholder value.
                See: https://groups.google.com/g/firebase-talk/c/fdjqrn93OcY/m/-Tml0ifSiV4J?pli=1.*/
            placeholder?: boolean;
            // Data about this availability.
            // To be determined in the next iteration.
        };
    };
    placeholder?: true;
};

/**
 * Data model representing an event's details and members' availabilities.
 */
export interface KonfluxEvent {
    /** The human-readable name of the event. Not a unique identifier. */
    name: string;
    /** The index of the earliest time block. */
    earliest: number;
    /** The index of the latest possible time block. */
    latest: number;
    /** A map from universal ISO dates to a map of time blocks and the people
        available during them. */
    groupAvailabilities: {
        [date: string]: AvailabilityInfo;
    };
    /** The people in this event. */
    members: {
        [username: string]: Omit<LocalEventMember, "username">;
    };
}

// An empty event object intended to be used for initialising state variables
// or set the starting values of a newly created events.
export const EMPTY_EVENT: KonfluxEvent = {
    name: "",
    earliest: 18,
    latest: 34,
    groupAvailabilities: {},
    members: {},
};

/* ------------------------ Read and write utilities ------------------------ */

/**
 * Watches for when the event object with the corresponding ID in the realtime
 * database changes (as a result of other users pushing their local changes)
 * and runs the given callback.
 * @param eventId
 * @param handleChange
 */
export const onEventChange = (
    eventId: string,
    handleChange: (newEvent: KonfluxEvent) => void,
) => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");
    const eventRef = ref(getDatabase(), `events/${eventId}`);
    onValue(eventRef, (snapshot) => {
        const currEvent = snapshot.val() as KonfluxEvent;
        handleChange(currEvent);
    });
};

/**
 * Creates a new event object in the connected Firebase realtime database
 * instance. The username of the creator becomes the 'owner' of the event.
 * @param eventName
 * @param creatorUsername
 * @returns
 */
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

/**
 * Using a local copy of the event's availabilities, push it to the remote copy
 * in the Firebase realtime db instance.
 *
 * @remarks
 * When successfully pushed to the database, other connected clients should
 * get the new changes immediately, assuming that `onEventChange` was invoked.
 *
 * @param eventId
 * @param availabilities
 */
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
