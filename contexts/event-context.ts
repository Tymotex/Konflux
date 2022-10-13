import { Status } from "components/sync-status/SyncStatus";
import {
    KonfluxEvent,
    EventMember,
    signUpMember,
    updateEventTimeRange,
    updateRemoteAvailabilities,
} from "models/event";
import { createContext, Dispatch } from "react";
import { spawnNotification } from "utils/notifications";

/* --------------------------- Reducer and actions -------------------------- */
export type EventAction =
    | { type: "SET_EVENT"; payload: { event: KonfluxEvent } }
    | {
          type: "SET_TIME_RANGE";
          payload: {
              eventId: string;
              earliestTimeIndex: number;
              latestTimeIndex: number;
              updateStatus: (status: Status) => void;
          };
      }
    | {
          type: "SET_AVAILABILITIES";
          payload: {
              eventId: string;
              groupAvailabilities: KonfluxEvent["groupAvailabilities"];
              updateStatus: (status: Status) => void;
          };
      }
    | {
          type: "ADD_MEMBER";
          payload: {
              eventId: string;
              user: EventMember;
          };
      };

export const eventReducer = (
    state: KonfluxEvent,
    action: EventAction,
): KonfluxEvent => {
    switch (action.type) {
        case "SET_EVENT":
            return action.payload.event;
        case "SET_TIME_RANGE": {
            const {
                eventId,
                earliestTimeIndex,
                latestTimeIndex,
                updateStatus,
            } = action.payload;
            updateEventTimeRange(eventId, earliestTimeIndex, latestTimeIndex)
                .then(() => {
                    updateStatus("success");
                })
                .catch((error) => {
                    spawnNotification(
                        "error",
                        `Couldn't sync to remote. Reason: ${error}`,
                    );
                    updateStatus("failure");
                });
            return {
                ...state,
                earliest: action.payload.earliestTimeIndex,
                latest: action.payload.latestTimeIndex,
            };
        }
        case "SET_AVAILABILITIES": {
            const { eventId, groupAvailabilities, updateStatus } =
                action.payload;
            updateRemoteAvailabilities(eventId, groupAvailabilities)
                .then(() => {
                    updateStatus("success");
                })
                .catch((error) => {
                    spawnNotification(
                        "error",
                        `Couldn't sync to remote. Reason: ${error}`,
                    );
                    updateStatus("failure");
                });
            // TODO: is it the case that affecting the local state is unnecessary if the update to remote succeeds? Because it would simply be pulled.
            return {
                ...state,
                groupAvailabilities: action.payload.groupAvailabilities,
            };
        }
        case "ADD_MEMBER": {
            const { eventId, user } = action.payload;

            // If the member already exists, do nothing.
            if (user.username in state.members) return state;

            // By default, new members other than the original creators are not
            // owners.
            const isOwner = Object.keys(state.members).length === 0;
            user.isOwner = isOwner;

            signUpMember(eventId, user).catch((err) =>
                spawnNotification(
                    "error",
                    `Couldn't sync to remote. Reason: ${err}`,
                ),
            );

            return {
                ...state,
                members: {
                    ...state.members,
                    [user.username]: {
                        scope: user.scope,
                        password: user.password,
                        email: user.email,
                        profilePicUrl: user.profilePicUrl,
                        isOwner,
                    },
                },
            };
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
