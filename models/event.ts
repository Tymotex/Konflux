import { getDatabase, onValue, push, ref, set } from "firebase/database";
import { NextRouter } from "next/router";
import { spawnNotification } from "utils/notifications";

/**
 * Recorded details of a member that has signed up to the event.
 */
export interface EventMember {
    username: string;
    scope: "local" | "global" | "";
    password?: string;
    email?: string;
    profilePicUrl?: string;
    isOwner?: boolean;
    placeholder?: boolean;
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
        [username: string]: Omit<EventMember, "username">;
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
export const onEventChange = async (
    eventId: string,
    handleChange: (newEvent: KonfluxEvent) => void,
    // This function is awkwardly coupled to the router as a workaround to
    // trying to catch exceptions in `onValue`.
    router: NextRouter,
) => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");

    try {
        const eventRef = ref(getDatabase(), `events/${eventId}`);

        onValue(eventRef, (snapshot) => {
            if (!snapshot.exists()) {
                router.push("/404");
                spawnNotification("error", "That event doesn't exist.");
                // throw new Error("Event does not exist.");
            }
            const currEvent = snapshot.val() as KonfluxEvent;
            handleChange(currEvent);
        });
    } catch (err) {
        throw new Error(
            `Failed to listen to event with ID '${eventId}'. Reason: ${err}`,
        );
    }
};

/**
 * Creates a new event object in the connected Firebase realtime database
 * instance. The username of the creator becomes the 'owner' of the event.
 * @param eventName
 * @param creatorUsername
 * @returns
 */
export const createEvent = async (
    eventName: string,
    creatorUsername: string,
    password: string,
): Promise<[string, KonfluxEvent]> => {
    const event: KonfluxEvent = {
        name: eventName,
        earliest: 18,
        latest: 34,
        groupAvailabilities: {},
        members: {
            [creatorUsername]: {
                isOwner: true,
                password: password,
            },
        },
    };
    try {
        const reference = await push(ref(getDatabase(), `events`), event);
        if (!reference.key) throw Error("Firebase did not assign an ID.");
        return [reference.key, event];
    } catch (err) {
        throw new Error(`Failed to create event. Reason: ${err}`);
    }
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
export const updateRemoteAvailabilities = async (
    eventId: string,
    availabilities: KonfluxEvent["groupAvailabilities"],
): Promise<void> => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");
    try {
        await set(
            ref(getDatabase(), `events/${eventId}/groupAvailabilities`),
            availabilities,
        );
    } catch (err) {
        throw new Error(
            `Failed to update the event's availabilities. Reason: ${err}`,
        );
    }
};

/**
 * Sets a new name for the event with the given ID.
 * @param eventId
 * @param newName name of the event to set. Between 0 and 255 characters.
 */
export const updateEventName = async (
    eventId: string,
    newName: string,
): Promise<void> => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");
    try {
        await set(ref(getDatabase(), `events/${eventId}/name`), newName);
    } catch (err) {
        throw new Error(`Failed to update the event's name. Reason: ${err}`);
    }
};

/**
 * Sets the starting and ending time index for the event.
 * @param eventId
 * @param earliestTimeIndex
 * @param latestTimeIndex
 */
export const updateEventTimeRange = async (
    eventId: string,
    earliestTimeIndex: number,
    latestTimeIndex: number,
): Promise<void> => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");
    try {
        const writeEarliest = set(
            ref(getDatabase(), `events/${eventId}/earliest`),
            earliestTimeIndex,
        );
        const writeLatest = set(
            ref(getDatabase(), `events/${eventId}/latest`),
            latestTimeIndex,
        );
        await Promise.all([writeEarliest, writeLatest]);
    } catch (err) {
        console.log("earliest:", earliestTimeIndex);
        console.log("latest:", latestTimeIndex);
        throw new Error(
            `Failed to update the event's time range. Reason: ${err}`,
        );
    }
};

/**
 * Creates a new member in the given event.
 * @param eventId
 * @param user
 */
export const signUpMember = async (eventId: string, user: EventMember) => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");
    try {
        const { username, ...userDetails } = user;
        await set(
            ref(getDatabase(), `events/${eventId}/members/${username}`),
            userDetails,
        );
    } catch (err) {
        throw new Error(`Failed to update the event's members. Reason: ${err}`);
    }
};

// /**
//  * Checks the given user's supplied details against their details in the remote
//  * event data.
//  * @param eventId
//  * @param user
//  */
// export const signInMember = async (eventId: string, username: string) => {
//     if (!eventId) throw new Error("Event ID mustn't be empty.");
//     // TODO: this would be where we need to check passwords.
// };
