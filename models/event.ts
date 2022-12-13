import { LocalEventMember } from "contexts/local-auth-context";
import {
    getDatabase,
    onValue,
    push,
    ref,
    remove,
    set,
    update,
} from "firebase/database";
import { NextRouter } from "next/router";
import { upsertEventToLocalStorage } from "utils/local-events-list";
import { spawnNotification } from "utils/notifications";
import { addEventToGlobalUser } from "./global-user";

/**
 * Recorded details of a member that has signed up to the event.
 */
export interface EventMember {
    id: string;
    username: string;
    scope: AuthScope;
    password?: string;
    email?: string;
    profilePicUrl?: string;
    isOwner?: boolean;
    placeholder?: boolean;
}

export type AuthScope = "local" | "global" | "";

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

export type EventMembers = {
    [username: string]: Omit<EventMember, "username">;
};

/**
 * Data model representing an event's details and members' availabilities.
 */
export interface KonfluxEvent {
    /** Database identifier. */
    id?: string | null;
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
    members: EventMembers;
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
                router.push("/");
                spawnNotification("warning", "Event no longer exists.");
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
export const createEventAndAddOwner = async (
    eventName: string,
    user: EventMember | LocalEventMember,
    password: string,
): Promise<[string, KonfluxEvent]> => {
    if (!user.scope) throw new Error("Auth scope must be specified");

    if (eventName.length === 0)
        throw new Error("Event name must not be empty.");
    else if (eventName.length >= 255)
        throw new Error("Event name must be fewer than 255 characters.");

    const creatorUsername = user.username;
    if (creatorUsername.length === 0) throw new Error("Username is required.");
    else if (creatorUsername.length >= 255)
        throw new Error("Username must be fewer than 255 characters.");

    if (password.length >= 64)
        throw new Error("Password must be fewer than 64 characters.");

    const memberData: any = {
        isOwner: true,
        scope: user.scope,
        password: password,
    };
    if (user.scope === "global" && "id" in user) memberData.id = user.id;

    const event: KonfluxEvent = {
        name: eventName,
        earliest: 18,
        latest: 34,
        groupAvailabilities: {},
        members: {
            [creatorUsername]: memberData,
        },
    };

    // Push the event object to the database.
    const reference = await push(ref(getDatabase(), `events`), event);
    const eventId = reference.key;
    if (!eventId) throw Error("Firebase did not assign an ID.");

    // Add the event ID to the global user's event list, if they exist.
    if (user.scope === "global" && "id" in user) {
        addEventToGlobalUser(user.id, eventId);
    } else {
        upsertEventToLocalStorage(eventId, eventName);
    }

    return [eventId, event];
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
export const signUpMember = async (
    eventId: string,
    user: EventMember | LocalEventMember,
): Promise<void> => {
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

/**
 * Remove member from the event. This only removes it from the member list, not
 * from the availabilities, which must be done separately.
 * @param eventId
 * @param username
 */
export const removeMember = async (eventId: string, username: string) => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");

    try {
        // Set to null to delete record in Firebase realtime db.
        // See: https://firebase.google.com/docs/database/web/read-and-write#delete_data.
        const memberRef = ref(
            getDatabase(),
            `events/${eventId}/members/${username}`,
        );
        await set(memberRef, null);
    } catch (err) {
        throw new Error(`Failed to update the event's members. Reason: ${err}`);
    }
};

export const deleteEvent = async (eventId: string, event: KonfluxEvent) => {
    if (!eventId) throw new Error("Event ID mustn't be empty.");

    const eventRef = ref(getDatabase(), `events/${eventId}`);

    // TODO: wrap in transaction.
    await remove(eventRef);
    const updates: any = {};
    Object.keys(event.members || {}).forEach((username) => {
        const member = event.members[username];
        if (member.scope === "global" && "id" in member) {
            updates["users/" + (member as any).id + "/eventIds/" + eventId] =
                null;
        }
    });

    console.log(updates);
    update(ref(getDatabase()), updates);
};
