import React, { Dispatch, SetStateAction } from "react";
import EventSignIn from "./EventSignIn";
import TimetableGrid from "./TimetableGrid";

// Holds an array of contiguous dates.
export type TimeInterval = string[];

interface Props {
    username: string;
    setUsername: Dispatch<SetStateAction<string>>;
    setPassword: Dispatch<SetStateAction<string>>;
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
    return (
        <>
            {!username && (
                <EventSignIn
                    setUsername={setUsername}
                    setPassword={setPassword}
                />
            )}
            <TimetableGrid
                username={username}
                eventId={eventId}
                disabled={!username}
            />
        </>
    );
};

export default Timetable;
