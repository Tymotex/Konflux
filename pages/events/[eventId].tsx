import { Container } from "components/container";
import { DaySelector } from "components/day-selector";
import styles from "./[eventId].module.scss";
import { PageTransition } from "components/page-transition";
import {
    FillingTimetable,
    GroupAvailabilityTimetable,
} from "components/timetable";
import { EventSignIn } from "components/event-credentials";
import { BASE_URL } from "constants/url";
import { EventContext, eventReducer } from "contexts/event-context";
import { AnimatePresence, motion } from "framer-motion";
import { EMPTY_EVENT, onEventChange, updateEventName } from "models/event";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { spawnNotification } from "utils/notifications";
import { TextField } from "components/form";
import { SyncStatus } from "components/sync-status";
import { Status } from "components/sync-status/SyncStatus";
import { ShareableLink } from "components/shareable-link";

const EventPage: NextPage = () => {
    const router = useRouter();
    const eventNameInput = useRef<HTMLInputElement>(null);

    // Using context and reducer together to allow for descendants to cleanly
    // modify the local single source of truth for the event's data.
    const [eventState, eventDispatch] = useReducer(eventReducer, EMPTY_EVENT);
    const contextValue = useMemo(
        () => ({ eventState, eventDispatch }),
        [eventState, eventDispatch],
    );

    // User credentials, localised just to this event.
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // Sync status of each input component.
    const [updateEventNameStatus, setUpdateEventNameStatus] =
        useState<Status>(null);

    // Get the event's ID from the route.
    const eventId = useMemo(
        () => (router.query.eventId ? String(router.query.eventId) : ""),
        [router],
    );

    // Fetch and listen for changes to the remote Event data object.
    useEffect(() => {
        if (eventId && eventDispatch)
            onEventChange(eventId, (newEvent) =>
                eventDispatch({
                    type: "SET_EVENT",
                    payload: { event: newEvent },
                }),
            ).catch((err) => {
                spawnNotification("error", err.message);
            });
    }, [eventId, eventDispatch]);

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

    /**
     * Push the local name change to the remote copy of the event.
     */
    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setUpdateEventNameStatus("pending");
            eventDispatch({
                type: "SET_EVENT",
                payload: { event: { ...eventState, name: e.target.value } },
            });

            if (!e.target.value) {
                spawnNotification("error", "Event name must not be empty.");
                setUpdateEventNameStatus("failure");
                return;
            }
            updateEventName(eventId, e.target.value)
                .then(() => {
                    setUpdateEventNameStatus("success");
                })
                .catch((err) => {
                    spawnNotification("error", err.message);
                    setUpdateEventNameStatus("failure");
                });
        },
        [eventId, setUpdateEventNameStatus],
    );

    return (
        <PageTransition>
            <EventContext.Provider value={contextValue}>
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        {/* TODO: refactor event credentials management. */}
                        {!username && (
                            <EventSignIn
                                eventId={eventId}
                                setUsername={setUsername}
                                setPassword={setPassword}
                            />
                        )}
                        {username &&
                            username in eventState.members &&
                            eventState.members[username].isOwner && (
                                <>
                                    <div className={styles.eventNameContainer}>
                                        <TextField
                                            id="event-name"
                                            refHandle={eventNameInput}
                                            required
                                            label="Event Name"
                                            placeholder="Dinner with Linus Torvalds"
                                            value={eventState?.name}
                                            onChange={handleNameChange}
                                            isTitle
                                        />
                                    </div>
                                    <SyncStatus
                                        status={updateEventNameStatus}
                                    />
                                    <div className={styles.heading}>
                                        <h2>
                                            What days could the event happen?
                                        </h2>
                                        <p>
                                            Click and drag the dates below to
                                            select which days to consider
                                            scheduling the event on.
                                        </p>
                                    </div>
                                    <div
                                        className={
                                            styles.calendarAndMapContainer
                                        }
                                    >
                                        <DaySelector
                                            eventId={eventId}
                                            eventState={eventState}
                                            eventDispatch={eventDispatch}
                                        />
                                    </div>
                                </>
                            )}
                        <div className={styles.timetableContainer}>
                            {/* Timetable for filling availabilities. */}
                            <FillingTimetable
                                username={username}
                                eventId={eventId}
                            />
                            {/* Timetable for showing the group's availabilities */}
                            <GroupAvailabilityTimetable
                                username={username}
                                eventId={eventId}
                            />
                        </div>
                        <section
                            className={styles.heading}
                            style={{ marginBottom: "56px" }}
                        >
                            <h2>Share this link with others.</h2>
                            <p>
                                Wait for them to fill in their availabilities
                                and then pick the time that works best.
                            </p>

                            <ShareableLink
                                link={`${BASE_URL}/events/${eventId}`}
                            />

                            <h3 style={{ marginTop: "56px" }}>
                                How was the planning experience?
                            </h3>
                            <h3 style={{ marginTop: "56px" }}>
                                Want to see a new feature?
                            </h3>
                            <p>Request one in less than 1 minute.</p>
                        </section>
                    </motion.div>
                </AnimatePresence>
            </EventContext.Provider>
        </PageTransition>
    );
};

export default EventPage;
