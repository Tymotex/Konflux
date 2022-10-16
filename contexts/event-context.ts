import { Status } from "components/sync-status/SyncStatus";
import {
    KonfluxEvent,
    EventMember,
    signUpMember,
    updateEventTimeRange,
    updateRemoteAvailabilities,
    removeMember,
} from "models/event";
import { createContext, Dispatch } from "react";
import { spawnNotification } from "utils/notifications";
import { LocalEventMember } from "./local-auth-context";

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
              user: EventMember | LocalEventMember;
          };
      }
    | {
          type: "REMOVE_MEMBER";
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
            // Note: it is probably the case that affecting the local state is
            //       unnecessary given that the remote update succeeds, because
            //       the remote state would simply be pulled.
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
        case "REMOVE_MEMBER": {
            const { eventId, username } = action.payload;

            const newEvent = { ...state };

            // TODO: if the user is the last user of the event, then delete the entire event.

            // Remove the member.
            if (username in state.members) delete newEvent.members[username];
            else return state;

            // Clear the member's availabilities by removing their username from
            // all time blocks.
            Object.keys(newEvent.groupAvailabilities || {}).forEach((date) => {
                // Timeblock indices
                Object.keys(newEvent.groupAvailabilities[date])
                    .map((i) => parseInt(i))
                    .filter((i) => !isNaN(i))
                    .forEach((timeBlockIndex: number) => {
                        if (
                            username in
                            newEvent.groupAvailabilities[date][timeBlockIndex]
                        )
                            delete newEvent.groupAvailabilities[date][
                                timeBlockIndex
                            ][username];
                    });
            });

            updateRemoteAvailabilities(
                eventId,
                newEvent.groupAvailabilities,
            ).catch((err) => {
                spawnNotification(
                    "error",
                    `Failed to remove availabilities. ${err.message}`,
                );
            });
            removeMember(eventId, username).catch((err) => {
                spawnNotification(
                    "error",
                    `Failed to remove membership. ${err.message}`,
                );
            });

            return newEvent;
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
