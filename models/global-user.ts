import {
    DataSnapshot,
    get,
    getDatabase,
    push,
    ref,
    set,
    update,
} from "firebase/database";
import { KonfluxEvent } from "./event";

// Note that the user details such as email, username, profile picture URL, etc.
// are stored and managed separately in Firebase Auth. We omit them from this
// user model to avoid redundancy.
export interface GlobalUser {
    // The user ID supplied by Firebase Auth.
    id: string;
    // The IDs of all the events that this user is a member or organiser of.
    eventIds: string[];
    placeholder?: boolean;
}

/* ------------------------ Read and write utilities ------------------------ */
/**
 * Fetches a list of all of the given global user's events.
 * @param userId
 * @returns
 */
export const getGlobalUserEvents = async (
    userId: string | null | undefined,
): Promise<KonfluxEvent[]> => {
    if (!userId) {
        throw new Error("User ID mustn't be empty");
    }

    const userRef = ref(getDatabase(), `users/${userId}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
        throw new Error(`The user with ID '${userId}' does not exist`);
    }

    const user = snapshot.val() as GlobalUser;
    if (!user) {
        throw new Error("Malformed user model.");
    }

    // Retrieve the event db objects corresponding to each of the event IDs
    // stored in the user.
    const eventQueries: Promise<DataSnapshot>[] = user.eventIds.map((id) => {
        return get(ref(getDatabase(), `events/${id}`));
    });

    const events: KonfluxEvent[] = (await Promise.all(eventQueries))
        .filter((snapshot) => snapshot.exists())
        .map((snapshot) => snapshot.val() as KonfluxEvent)
        .filter((event) => !!event);

    return events;
};

/**
 * Creates a new user model in Firebase realtime db.
 * @param userId the ID for the user.
 * @returns whether the user was created.
 */
export const createGlobalUserIfNotExist = async (
    userId: string | null | undefined,
): Promise<boolean> => {
    if (!userId) throw new Error("User ID must be non-empty to create a user.");

    const userRef = ref(getDatabase(), `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) return false;

    // Create the new user object.
    const userData: Omit<GlobalUser, "id"> = {
        eventIds: [],
        placeholder: true,
    };
    await set(userRef, userData);

    return true;
};

export const addEventToGlobalUser = async (
    userId: string | null | undefined,
    eventId: string | null | undefined,
): Promise<void> => {
    if (!userId) throw new Error("User ID is empty.");
    if (!eventId) throw new Error("Event ID is empty.");

    const userEventsListEntryRef = ref(
        getDatabase(),
        `users/${userId}/eventIds/${eventId}`,
    );
    await set(userEventsListEntryRef, true);
};
