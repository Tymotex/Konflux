import dayjs from "dayjs";
import { KonfluxEvent } from "models/event";

/**
 * Executes the given action on the given state, returning the next state.
 * @param state the original state
 * @param action the action to carry out and its data
 * @returns the new state
 */
export const rangeSelectionReducer = (
    state: RangeSelectionState,
    action: RangeSelectionAction,
) => {
    switch (action.type) {
        case "BEGIN_SELECTION": {
            const { isSelecting, startDate } = action.payload;
            return {
                ...state,
                isSelectingRange: isSelecting,
                isDeselectingRange: !isSelecting,
                startDate,
            };
        }
        case "SET_SELECTION_END": {
            const { endDate } = action.payload;
            return {
                ...state,
                endDate,
            };
        }
        case "COMMIT_SELECTION": {
            const { availabilities, onCommit } = action.payload;
            const { isSelectingRange, isDeselectingRange, startDate, endDate } =
                state;
            const newAvailabilities = {
                ...availabilities,
            };

            const endDay = dayjs(endDate >= startDate ? endDate : startDate);
            let currDay = dayjs(startDate <= endDate ? startDate : endDate);
            while (currDay.isBefore(endDay) || currDay.isSame(endDay)) {
                // Adds or removes selected days if we're selecting or
                // deselecting respectively.
                const date = currDay.format("YYYY-MM-DD");
                if (isSelectingRange)
                    newAvailabilities[date] = { placeholder: true };
                else if (isDeselectingRange) delete newAvailabilities[date];
                else
                    throw new Error(
                        "Neither selecting nor deselecting. Please try again.",
                    );
                currDay = currDay.add(1, "day");
            }
            onCommit(newAvailabilities);
            return NO_SELECTION;
        }
        case "RESET": {
            return NO_SELECTION;
        }
        default: {
            throw new Error(
                `Unknown action type: '${
                    (action as RangeSelectionAction).type
                }'`,
            );
        }
    }
};

type RangeSelectionAction =
    | {
          type: "BEGIN_SELECTION";
          payload: {
              /** If this is falses, it means deselection */
              isSelecting: boolean;
              startDate: string;
          };
      }
    | { type: "SET_SELECTION_END"; payload: { endDate: string } }
    | {
          type: "COMMIT_SELECTION";
          payload: {
              availabilities: KonfluxEvent["groupAvailabilities"];
              onCommit: (
                  newAvailabilities: KonfluxEvent["groupAvailabilities"],
              ) => void;
          };
      }
    | { type: "RESET" };

export type RangeSelectionState = {
    isSelectingRange: boolean;
    isDeselectingRange: boolean;
    /** Starting day of the range(where the user's mouse started and exited. Universal ISO format("YYYY-MM-DD") */
    startDate: string;
    /** The last hovered day of the range. Universal ISO format("YYYY-MM-DD") */
    endDate: string;
};

export const NO_SELECTION: RangeSelectionState = {
    isSelectingRange: false,
    isDeselectingRange: false,
    startDate: "",
    endDate: "",
};
