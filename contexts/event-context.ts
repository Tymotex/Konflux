import { Status } from "components/sync-status/SyncStatus";
import {
    MAX_ATTENDEES_PER_EVENT,
    MAX_DATES_SELECTABLE,
} from "constants/limits";
import {
    KonfluxEvent,
    EventMember,
    signUpMember,
    updateEventTimeRange,
    updateRemoteAvailabilities,
    removeMember,
    deleteEvent,
    EMPTY_EVENT,
} from "models/event";
import { addEventToGlobalUser } from "models/global-user";
import { createContext, Dispatch } from "react";
import {
    removeEventFromLocalStorage,
    upsertEventToLocalStorage,
} from "utils/local-events-list";
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
              onSuccess: () => void;
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

            // Check that not too many days have been selected.
            if (
                Object.keys(groupAvailabilities || {}).length >
                MAX_DATES_SELECTABLE
            ) {
                spawnNotification(
                    "error",
                    `You cannot select more than ${MAX_DATES_SELECTABLE} days. Please make a feature request if you'd like this to change.`,
                );
                return state;
            }

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
            const { eventId, user, onSuccess } = action.payload;

            // If the member already exists, do nothing.
            if (user.username in state.members) return state;

            // If there are too many attendees, then reject the attempt.
            if (
                Object.keys(state.members || {}).length >=
                MAX_ATTENDEES_PER_EVENT
            ) {
                throw new Error(
                    `Cannot have more than ${MAX_ATTENDEES_PER_EVENT} attendees`,
                );
            }

            // By default, new members other than the original creators are not
            // owners.
            if (!user.isOwner && Object.keys(state.members).length === 0) {
                user.isOwner = true;
            } else {
                user.isOwner = false;
            }

            signUpMember(eventId, user)
                .then(() => {
                    // Add the event to the global user's list of events.
                    if (user.scope === "global" && "id" in user) {
                        addEventToGlobalUser(user.id, eventId).catch((err) => {
                            spawnNotification(
                                "error",
                                `Couldn't add this event to your list of events. ${err}`,
                            );
                        });
                    } else {
                        upsertEventToLocalStorage(eventId, state.name);
                    }

                    onSuccess();
                })
                .catch((err) =>
                    spawnNotification(
                        "error",
                        `Couldn't sign up to event. ${err}`,
                    ),
                );

            const memberData: any = {
                scope: user.scope,
                password: user.password,
                email: user.email,
                profilePicUrl: user.profilePicUrl,
                isOwner: user.isOwner,
            };
            if (user.scope === "global" && "id" in user)
                memberData.id = user.id;

            return {
                ...state,
                members: {
                    ...state.members,
                    [user.username]: memberData,
                },
            };
        }
        case "REMOVE_MEMBER": {
            const { eventId, username } = action.payload;
            const newEvent = { ...state };

            // Do nothing if the given user is not a member.
            if (!(username in state.members)) return state;

            const isLastOwner = newEvent.members[username].isOwner;

            // If the current user is the last owner of the event, then delete
            // the entire event.
            // Note: there is currently only 1 owner per event.
            if (isLastOwner) {
                deleteEvent(eventId, newEvent);
                return EMPTY_EVENT;
            } else {
                // Remove the member.
                delete newEvent.members[username];

                // Clear the member's availabilities by removing their username from
                // all time blocks.
                Object.keys(newEvent.groupAvailabilities || {}).forEach(
                    (date) => {
                        // Timeblock indices
                        Object.keys(newEvent.groupAvailabilities[date])
                            .map((i) => parseInt(i))
                            .filter((i) => !isNaN(i))
                            .forEach((timeBlockIndex: number) => {
                                if (
                                    username in
                                    newEvent.groupAvailabilities[date][
                                        timeBlockIndex
                                    ]
                                )
                                    delete newEvent.groupAvailabilities[date][
                                        timeBlockIndex
                                    ][username];
                            });
                    },
                );

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
