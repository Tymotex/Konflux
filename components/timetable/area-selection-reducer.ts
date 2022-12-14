import { KonfluxEvent } from "models/event";
import { createNewAvailabilitiesAfterSelection } from "./timetable-utils";

// Global variables recording the last highlighted area's boundaries. This
// is part of a workaround to prevent "Maximum update depth exceeded". See
// issue #30.
let prevStartTime: number | undefined;
let prevEndTime: number | undefined;
let prevStartDate: string | undefined;
let prevEndDate: string | undefined;
let prevIsSelectingArea: boolean | undefined;

/**
 * Executes the given action on the given state, returning the next state.
 * @param state the original selection state
 * @param action the action to carry out and its data
 * @returns the new state
 */
export const areaSelectionReducer = (
    state: AreaSelectionState,
    action: AreaSelectionAction,
): AreaSelectionState => {
    switch (action.type) {
        case "BEGIN_SELECTION": {
            const { isSelecting, startTime, startDate } = action.payload;
            return {
                ...state,
                isSelectingArea: isSelecting,
                isDeselectingArea: !isSelecting,
                startTime,
                startDate,
            };
        }
        case "SET_SELECTION_END": {
            const { endTime, endDate } = action.payload;
            return {
                ...state,
                endTime,
                endDate,
            };
        }
        case "COMMIT_SELECTION": {
            const {
                availabilities,
                username,
                earliestTimeIndex,
                maxRows,
                onCommit,
            } = action.payload;
            const {
                startTime,
                endTime,
                startDate,
                endDate,
                isSelectingArea,
                isDeselectingArea,
            } = state;

            if (
                startTime === prevStartTime &&
                endTime === prevEndTime &&
                startDate === prevStartDate &&
                endDate === prevEndDate &&
                prevIsSelectingArea === isSelectingArea
            ) {
                return NO_SELECTION;
            } else {
                // TODO Account for selecting/deselecting.
                prevStartTime = startTime;
                prevEndTime = endTime;
                prevStartDate = startDate;
                prevEndDate = endDate;
                prevIsSelectingArea = isSelectingArea;
            }

            const newAvailabilities = createNewAvailabilitiesAfterSelection(
                availabilities,
                username,
                startTime,
                endTime,
                startDate,
                endDate,
                earliestTimeIndex,
                maxRows,
                isSelectingArea,
                isDeselectingArea,
            );
            onCommit(newAvailabilities);
            return NO_SELECTION;
        }
        case "RESET":
            return NO_SELECTION;
        default:
            throw new Error(
                `Unknown action: '${(action as AreaSelectionAction).type}'`,
            );
    }
};

// Selection state with all range-tracking variables reset.
export const NO_SELECTION: AreaSelectionState = {
    isSelectingArea: false,
    isDeselectingArea: false,
    startTime: undefined,
    endTime: undefined,
    startDate: undefined,
    endDate: undefined,
};

export type AreaSelectionAction =
    | {
          type: "BEGIN_SELECTION";
          payload: {
              /** If this is false, it means deselection */
              isSelecting: boolean;
              startTime: number;
              startDate: string;
          };
      }
    | {
          type: "SET_SELECTION_END";
          payload: {
              endTime: number;
              endDate: string;
          };
      }
    | {
          type: "COMMIT_SELECTION";
          payload: {
              availabilities: KonfluxEvent["groupAvailabilities"];
              username: string;
              earliestTimeIndex: number;
              maxRows: number;
              onCommit: (
                  newAvailabilities: KonfluxEvent["groupAvailabilities"],
              ) => void;
          };
      }
    | {
          type: "RESET";
      };

// State for tracking whether the user's selection or deselection of a
// rectangular area of time blocks.
export type AreaSelectionState = {
    isSelectingArea: boolean;
    isDeselectingArea: boolean;
    startTime: number | undefined;
    endTime: number | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
};
