import { KonfluxEvent, updateRemoteAvailabilities } from "models/event";
import { createContext, Dispatch } from "react";
import { spawnNotification } from "utils/notifications";

/* --------------------------- Reducer and actions -------------------------- */
type EventAction =
    | { type: "SET_EVENT"; payload: { event: KonfluxEvent } }
    | {
          type: "SET_AVAILABILITIES";
          payload: {
              eventId: string;
              groupAvailabilities: KonfluxEvent["groupAvailabilities"];
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
            return {
                ...state,
                groupAvailabilities: action.payload.groupAvailabilities,
            };
        default:
            throw new Error(
                `Unknown event action type ${(action as EventAction).type}`,
            );
    }
};

/* --------------------------------- Context -------------------------------- */
export interface EventContextInterface {
    state: KonfluxEvent;
    dispatch: Dispatch<EventAction>;
}

export const EventContext = createContext<EventContextInterface>(
    {} as EventContextInterface,
);
