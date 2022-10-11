import { EventAction } from "contexts/event-context";
import { EventMember, KonfluxEvent } from "models/event";
import { Dispatch, useEffect } from "react";
import { useGlobalUser } from "utils/global-auth";

/**
 * Returns the event member's credentials.
 * 1. First, if the user is globally authenticated, then we use their global
 *    details.
 * 2. Otherwise, we'll fall back to using local authentication details (which
 *    are gathered using the `EventSignIn` component).
 * 3. Register the member to the event if they don't already exist.
 *
 * It's invalid for the user to be both globally and locally authenticated.
 *
 * @param eventId
 * @param eventState
 * @param eventDispatch
 * @param localAuthState
 * @param localAuthDispatch
 */
export const useGlobalOrLocalEventMember = (
    localAuthState: EventMember,
): EventMember | null => {
    const globalUser = useGlobalUser();

    // It's invalid for both global and local auth to exist.
    if (globalUser && localAuthState && localAuthState.username) {
        throw new Error(
            "Expected user to only be authenticated either globally xor locally, but both were true.",
        );
    }

    // Prefer using global auth details, if they exist.
    if (globalUser) {
        return globalUser;
    } else if (localAuthState && localAuthState.username) {
        // Use local auth details, if they exist, as a fallback when global auth
        // does not exist.
        return localAuthState;
    } else {
        // Neither global nor local auth details exist. The user must provide one
        // of them.
        return null;
    }
};

/**
 * Registers the given user by writing them into the event model, if they are
 * already registered.
 * Baking the user details into the event directly will improve performance
 * since they can be quickly retrieved.
 * @param user
 * @param eventId
 * @param eventState
 * @param eventDispatch
 */
export const useWatchAndAddMemberToEventIfNotExist = (
    user: EventMember | null,
    eventId: string,
    eventState: KonfluxEvent,
    eventDispatch: Dispatch<EventAction>,
): void => {
    useEffect(() => {
        if (!eventId) return;
        if (!user) return;

        if (!(user.username in eventState.members)) {
            eventDispatch({ type: "ADD_MEMBER", payload: { eventId, user } });
        }
    }, [eventId, user, eventState, eventDispatch]);
};

/**
 * Determines whether the given user is an owner of the given event.
 * @param user
 * @param eventState
 * @returns
 */
export const useDetermineIsOwner = (
    user: EventMember | null,
    eventState: KonfluxEvent,
): boolean => {
    return user &&
        user.username &&
        user.username in eventState.members &&
        eventState.members[user.username].isOwner
        ? true
        : false;
};
