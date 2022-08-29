import {
    signUpMember,
    KonfluxEvent,
    updateRemoteAvailabilities,
    signInMember,
} from "models/event";
import { createContext, Dispatch } from "react";
import { spawnNotification } from "utils/notifications";

/* --------------------------- Reducer and actions -------------------------- */
export type EventAction =
    | { type: "SET_EVENT"; payload: { event: KonfluxEvent } }
    | {
          type: "SET_AVAILABILITIES";
          payload: {
              eventId: string;
              groupAvailabilities: KonfluxEvent["groupAvailabilities"];
          };
      }
    | {
          type: "SIGN_UP_MEMBER";
          payload: {
              eventId: string;
              username: string;
          };
      }
    | {
          type: "SIGN_IN_MEMBER";
          payload: {
              eventId: string;
              username: string;
          };
      };

export const eventReducer = (
    state: KonfluxEvent,
    action: EventAction,
): KonfluxEvent => {
    switch (action.type) {
        case "SET_EVENT":
            return action.payload.event;
        case "SET_AVAILABILITIES":
            updateRemoteAvailabilities(
                action.payload.eventId,
                action.payload.groupAvailabilities,
            ).catch((error) =>
                spawnNotification(
                    "error",
                    `Couldn't sync to remote. Reason: ${error}`,
                ),
            );
            // TODO: is it the case that affecting the local state is unnecessary if the update to remote succeeds? Because it would simply be pulled.
            return {
                ...state,
                groupAvailabilities: action.payload.groupAvailabilities,
            };
        case "SIGN_UP_MEMBER": {
            const { eventId, username } = action.payload;
            signUpMember(eventId, { username, isOwner: false }).catch((err) =>
                spawnNotification(
                    "error",
                    `Couldn't sync to remote. Reason: ${err}`,
                ),
            );
            return {
                ...state,
                members: {
                    ...state.members,
                    [username]: {
                        isOwner: false,
                    },
                },
            };
        }
        case "SIGN_IN_MEMBER": {
            const { eventId, username } = action.payload;
            signInMember(eventId, username).catch((err) =>
                spawnNotification("error", `Couldn't sign in. Reason: ${err}`),
            );
            return state;
        }
        default:
            throw new Error(
                `Unknown event action type ${(action as EventAction).type}`,
            );
    }
};

/* --------------------------------- Context -------------------------------- */
export interface EventContextInterface {
    eventState: KonfluxEvent;
    eventDispatch: Dispatch<EventAction>;
}

export const EventContext = createContext<EventContextInterface>(
    {} as EventContextInterface,
);
