import { KonfluxEvent } from "models/event";
import { createContext, Dispatch } from "react";
import { spawnNotification } from "utils/notifications";
import { EventAction } from "./event-context";

/* --------------------------- Reducer and actions -------------------------- */
// Note: there are two different 'strategies' for authentication.
// 1. Local: no registration is required. The user simply enters a username and
//    password and that's it, but these details are scoped only to the current
//    event and must be re-entered when the page is revisited.
// 2. Global: this is how registration is handled in all other apps. The user
//    logs in once, then their information persists and can be used instead of
//    local authentication for each event.
export type AuthAction =
    | {
          type: "LOCAL_LOGIN";
          payload: {
              event: KonfluxEvent;
              username: string;
              localPassword?: string;
          };
      }
    | {
          type: "LOCAL_REGISTER";
          payload: {
              eventId: string;
              event: KonfluxEvent;
              eventDispatch: Dispatch<EventAction>;
              username: string;
              localPassword?: string;
          };
      }
    | {
          // Note: this does not actually log in the user. For that, use the
          // auth utilities in `utils/auth.ts`. This only sets the state so that
          // the UI knows the username that it can use for filling in the
          // availabilities in the timetable.
          type: "GLOBAL_LOGIN";
          payload: {
              username: string;
              email: string;
              profilePicUrl: string;
          };
      }
    | {
          type: "GLOBAL_SIGN_OUT";
      };

export type AuthState = {
    username: string;
    localPassword?: string;
    profilePicUrl?: string;
    authType: "local" | "global" | null;
};

export const authReducer = (state: AuthState, action: AuthAction) => {
    switch (action.type) {
        case "LOCAL_LOGIN": {
            const { event, username, localPassword } = action.payload;

            // Check the supplied username and password pair match the local
            // authentication.
            if (!(username in event.members))
                throw new Error(
                    `Username '${username}' not found in this event's members list.`,
                );
            const expectedLocalPassword = event.members[username].password;
            if (
                expectedLocalPassword &&
                localPassword !== expectedLocalPassword
            ) {
                spawnNotification("error", `Incorrect password.`);
                return state;
            }

            spawnNotification("success", "Logged in locally for this event.");
            return {
                username,
                localPassword,
                authType: "local",
            };
        }
        case "LOCAL_REGISTER": {
            const { event, eventId, eventDispatch, username, localPassword } =
                action.payload;

            if (username in event.members)
                throw new Error(`Username '${username}' is already a member.`);

            eventDispatch({
                type: "SIGN_UP_MEMBER",
                payload: {
                    eventId: eventId,
                    user: { username, password: localPassword },
                },
            });

            return {
                username,
                localPassword,
                authType: "local",
            };
        }
        case "GLOBAL_LOGIN": {
            const { username, email, profilePicUrl } = action.payload;

            return {
                username,
                email,
                profilePicUrl,
                authType: "global",
            };
        }
        case "GLOBAL_SIGN_OUT": {
            return {
                usename: "",
                email: "",
                profilePicUrl: "",
                authType: null,
            };
        }
        default:
            return state;
    }
};

/* --------------------------------- Context -------------------------------- */
export interface AuthContextInterface {
    authState: AuthState;
    authDispatch: Dispatch<AuthAction>;
}

export const EMPTY_AUTH_STATE = {
    username: "",
};

export const AuthContext = createContext<AuthContextInterface>(
    {} as AuthContextInterface,
);
