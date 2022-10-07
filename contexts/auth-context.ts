import { KonfluxEvent } from "models/event";
import { createContext, Dispatch } from "react";
import { spawnNotification } from "utils/notifications";
import { EventAction } from "./event-context";

/* --------------------------- Reducer and actions -------------------------- */
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
      };

export type AuthState = {
    username: string;
    localPassword?: string;
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

            return { username, localPassword };
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
