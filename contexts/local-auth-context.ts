import { EventMember, KonfluxEvent } from "models/event";
import { createContext, Dispatch } from "react";
import { AVATAR_PLACEHOLDER_URL } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";

/* --------------------------- Reducer and actions -------------------------- */
// Note: there are two different 'strategies' for authentication.
// 1. Local: no registration is required. The user simply enters a username and
//    password and that's it, but these details are scoped only to the current
//    event and must be re-entered when the page is revisited.
// 2. Global: this is how registration is handled in all other apps. The user
//    logs in once, then their information persists and can be used instead of
//    local authentication for each event.
//
// This file provides utilities only for dealing with local auth, scoped to
// just one event only.
//
export type LocalAuthAction =
    | {
          type: "LOCAL_SIGN_IN";
          payload: {
              event: KonfluxEvent;
              username: string;
              localPassword?: string;
          };
      }
    | {
          type: "LOCAL_SIGN_UP";
          payload: {
              event: KonfluxEvent;
              username: string;
              localPassword?: string;
          };
      }
    | { type: "LOCAL_SIGN_OUT" };

export const localAuthReducer = (
    state: EventMember,
    action: LocalAuthAction,
): EventMember => {
    switch (action.type) {
        case "LOCAL_SIGN_IN": {
            const { event, username, localPassword } = action.payload;

            // Check the supplied username and password pair match the local
            // authentication.
            if (!(username in event.members))
                throw new Error(
                    `Username '${username}' expected in this event's members list.`,
                );

            // Expect the passwords to match, only if a password was originally
            // set when the user first registered.
            const expectedLocalPassword = event.members[username].password;
            if (
                expectedLocalPassword &&
                localPassword !== expectedLocalPassword
            ) {
                spawnNotification("warning", `Incorrect password.`);
                return state;
            } else if (!expectedLocalPassword && localPassword) {
                spawnNotification(
                    "warning",
                    `You supplied a password but you didn't set one when you registered. Ignoring.`,
                );
            }

            return {
                username,
                password: localPassword,
                scope: "local",
                profilePicUrl: AVATAR_PLACEHOLDER_URL,
            };
        }
        case "LOCAL_SIGN_UP": {
            const { event, username, localPassword } = action.payload;

            // Expects the user to not be already signed up.
            if (username in event.members)
                throw new Error(`Username '${username}' is already a member.`);

            if (localPassword && localPassword.length > 64)
                throw new Error("Keep your password under 64 characters.");

            return {
                username,
                password: localPassword,
                profilePicUrl: AVATAR_PLACEHOLDER_URL,
                scope: "local",
            };
        }
        case "LOCAL_SIGN_OUT": {
            return EMPTY_EVENT_USER;
        }
        default:
            return state;
    }
};

/* --------------------------------- Context -------------------------------- */
export interface LocalAuthContextInterface {
    localAuthState: EventMember;
    localAuthDispatch: Dispatch<LocalAuthAction>;
}

export const EMPTY_EVENT_USER: any = {
    username: "",
    scope: "",
};

export const LocalAuthContext = createContext<LocalAuthContextInterface>(
    {} as LocalAuthContextInterface,
);
