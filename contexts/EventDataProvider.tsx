import { EMPTY_EVENT, KonfluxEvent } from "models/event";
import React, { useMemo, useReducer } from "react";
import { EventContext, eventReducer } from "./event-context";

interface EventDataProviderProps {
    children: React.ReactNode;
    event?: KonfluxEvent;
}

export const EventDataProvider: React.FC<EventDataProviderProps> = ({
    children,
    event,
}) => {
    const [eventState, eventDispatch] = useReducer(
        eventReducer,
        event ? event : EMPTY_EVENT,
    );
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
