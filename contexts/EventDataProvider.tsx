import { EMPTY_EVENT } from "models/event";
import React, { useMemo, useReducer } from "react";
import { EventContext, eventReducer } from "./event-context";

interface EventDataProviderProps {
    children: React.ReactNode;
}

export const EventDataProvider: React.FC<EventDataProviderProps> = ({
    children,
}) => {
    const [eventState, eventDispatch] = useReducer(eventReducer, EMPTY_EVENT);
    const cachedEventContext = useMemo(
        () => ({ eventState, eventDispatch }),
        [eventState, eventDispatch],
    );

    return (
        <EventContext.Provider value={cachedEventContext}>
            {children}
        </EventContext.Provider>
    );
};
