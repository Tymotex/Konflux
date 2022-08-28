import chroma from "chroma-js";
import { EventContext } from "contexts/event-context";
import React, { Dispatch, SetStateAction, useContext, useMemo } from "react";
import EventSignIn from "./EventSignIn";
import TimetableGrid from "./TimetableGrid";

/** Holds an array of contiguous dates. */
export type TimeInterval = string[];

interface Props {
    username: string;
    setUsername?: Dispatch<SetStateAction<string>>;
    setPassword?: Dispatch<SetStateAction<string>>;
    eventId: string;
    showGroupAvailability?: boolean;
}

const Timetable: React.FC<Props> = ({
    showGroupAvailability = false,
    username,
    setUsername,
    setPassword,
    eventId,
}) => {
    const { eventState, eventDispatch } = useContext(EventContext);

    // An array of string hex codes with a length equal to the number of members
    // in this event.
    // TODO: is it best to put this here and not in TimetableGrid?
    const colourScale = useMemo(() => {
        return (
            chroma
                // TODO: parameterise this to make sure it matches the timeblock colours.
                .scale(["whitesmoke", "blue"])
                .colors(Object.keys(eventState.members).length + 1)
        );
    }, [eventState.members]);

    return (
        <>
            {/* TODO: refactor event credentials management. */}
            {!username && setUsername && setPassword && (
                <EventSignIn
                    eventId={eventId}
                    setUsername={setUsername}
                    setPassword={setPassword}
                />
            )}
            <TimetableGrid
                username={username}
                eventId={eventId}
                disabled={!username && !showGroupAvailability}
                showGroupAvailability={showGroupAvailability}
                colourScale={colourScale}
            />
        </>
    );
};

export default Timetable;
