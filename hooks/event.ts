import { EventAction } from "contexts/event-context";
import {
    LocalAuthContext,
    LocalEventMember,
} from "contexts/local-auth-context";
import { EMPTY_EVENT, EventMember, KonfluxEvent } from "models/event";
import { useRouter } from "next/router";
import { Dispatch, useContext, useEffect, useMemo } from "react";
import { useGlobalUser } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";

/**
 * Determines the event ID from the current route.
 * @returns eventId string
 */
export const useEventId = (): string | null => {
    const router = useRouter();

    const eventId = useMemo(
        () => (router.query.eventId ? String(router.query.eventId) : null),
        [router],
    );

    return eventId;
};

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
    localAuthState: EventMember | LocalEventMember,
): EventMember | LocalEventMember | null => {
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
    user: EventMember | LocalEventMember | null,
    eventId: string | null,
    eventState: KonfluxEvent,
    eventDispatch: Dispatch<EventAction>,
): void => {
    useEffect(() => {
        if (!eventId) return;
        if (!user) return;

        if (
            eventState !== EMPTY_EVENT &&
            !(user.username in eventState.members)
        ) {
            spawnNotification("info", "You're now a member of this event.");
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
    user: EventMember | LocalEventMember | null,
    eventState: KonfluxEvent,
): boolean => {
    return user &&
        user.username &&
        user.username in eventState.members &&
        eventState.members[user.username].isOwner
        ? true
        : false;
};

/**
 * Resets the local auth state. Useful for pages other than the event page since
 * the local authentication is scoped only to that one event.
 */
export const useClearAuthOnPageMount = () => {
    const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);
    const eventId = useEventId();
    const router = useRouter();

    useEffect(() => {
        router.events.on("routeChangeStart", () => {
            // Invalidate the local auth credentials when the current page's event
            // ID does not match the credential's.
            // if (!eventId || localAuthState.eventId !== eventId) {
            //     // alert("LOGGED OUT");
            //     localAuthDispatch({ type: "LOCAL_SIGN_OUT" });
            // }
        });
    }, [eventId, localAuthState, localAuthDispatch, router]);

    // const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);

    // useEffect(() => {
    //     return () => {
    //         if (localAuthState && localAuthState.username) {
    //             localAuthDispatch({ type: "LOCAL_SIGN_OUT" });
    //         }
    //     };
    // }, [localAuthDispatch, localAuthState]);
};

/**
 * Determines if there is an auth bypass attempt.
 * @returns
 */
export const useDetectAuthBypassAttempt = (): boolean => {
    const router = useRouter();

    const isBypassing = useMemo(() => {
        const { username } = router.query;
        return username ? true : false;
    }, [router]);

    return isBypassing;
};

/**
 * Automatically dispatch a local sign in attempt when the URL contains
 * query parameters for the user's local credentials.
 * Why? This is to save the user from having to re-enter credentials when they
 *      make the event and get redirected to the event page.
 */
export const useBypassEventSignInWithURL = (
    eventId: string | null,
    event: KonfluxEvent,
) => {
    const { localAuthDispatch } = useContext(LocalAuthContext);
    const router = useRouter();

    const isBypassing = useDetectAuthBypassAttempt();

    useEffect(() => {
        if (isBypassing && eventId) {
            const { username, password } = router.query;
            if (username) {
                const usernameStr = String(username);
                const passwordStr = String(password);
                if (usernameStr in event.members) {
                    localAuthDispatch({
                        type: "LOCAL_SIGN_IN",
                        payload: {
                            eventId: eventId,
                            event: event,
                            username: usernameStr,
                            localPassword: passwordStr,
                        },
                    });
                    router.replace(`/events/${eventId}`);
                }
            }
        }
    }, [isBypassing, event, eventId]);
};