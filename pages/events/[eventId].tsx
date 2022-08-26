import { Container } from "components/container";
import { DaySelector } from "components/day-selector";
import { PageTransition } from "components/page-transition";
import { Timetable } from "components/timetable";
import { BASE_URL } from "constants/url";
import { EventContext, eventReducer } from "contexts/event-context";
import { AnimatePresence, motion } from "framer-motion";
import { EMPTY_EVENT, onEventChange } from "models/event";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { spawnNotification } from "utils/notifications";

const EventPage: NextPage = () => {
    const router = useRouter();
    const eventNameInput = useRef<HTMLInputElement>(null);

    // Using context and reducer together to allow for descendants to cleanly
    // modify the local single source of truth for the event's data.
    const [state, dispatch] = useReducer(eventReducer, EMPTY_EVENT);
    const contextValue = useMemo(
        () => ({ state, dispatch }),
        [state, dispatch],
    );

    // User credentials, localised just to this event.
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // Get the event's ID from the route.
    const eventId = useMemo(
        () => (router.query.eventId ? String(router.query.eventId) : ""),
        [router],
    );

    // Fetch and listen for changes to the remote Event data object.
    useEffect(() => {
        if (eventId && dispatch)
            onEventChange(eventId, (newEvent) =>
                dispatch({
                    type: "SET_EVENT",
                    payload: { event: newEvent },
                }),
            ).catch((err) => {
                spawnNotification("error", err);
            });
    }, [eventId, dispatch]);

    // Grab the username and password transmitted through navigation from a
    // previous page. See: https://www.youtube.com/watch?v=7wzMMBRVrfw.
    useEffect(() => {
        const {
            query: { username, password },
        } = router;
        if (username) {
            setUsername(String(username));
            setPassword(String(password));
            // Clear URL query parameters.
            // See: https://stackoverflow.com/questions/65606974/next-js-how-to-remove-query-params.
            router.replace(`/events/${eventId}`, undefined, { shallow: true });
        }
    }, [router, eventId]);

    return (
        <PageTransition>
            <Container>
                <EventContext.Provider value={contextValue}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <label htmlFor="event-name">Event Name</label>
                            <input
                                ref={eventNameInput}
                                id="event-name"
                                type="text"
                                placeholder="Eg. Math group study"
                                defaultValue={state?.name}
                                onChange={() => {
                                    // TODO: push commit to remote.
                                }}
                            />
                            <div>
                                Share with invitees the link:{" "}
                                <strong>{`${BASE_URL}/events/${eventId}`}</strong>
                            </div>
                            <DaySelector eventId={eventId} />
                            {/* Timetable for filling availabilities. */}
                            <Timetable
                                username={username}
                                setUsername={setUsername}
                                setPassword={setPassword}
                                eventId={eventId}
                            />
                            {/* Timetable for showing the group's availabilities */}
                            {/* <Timetable showGroupAvailability /> */}
                            <pre>
                                {JSON.stringify(state || "Nothing", null, 4)}
                            </pre>
                        </motion.div>
                    </AnimatePresence>
                </EventContext.Provider>
            </Container>
        </PageTransition>
    );
};

export default EventPage;