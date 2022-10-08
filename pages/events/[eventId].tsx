import { Button } from "components/button";
import { Callout } from "components/callout";
import { DaySelector } from "components/day-selector";
import { EventSignIn } from "components/event-credentials";
import { TextField } from "components/form";
import InfoIcon from "components/form/info.svg";
import { PageTransition } from "components/page-transition";
import { ShareableLink } from "components/shareable-link";
import { SyncStatus } from "components/sync-status";
import { Status } from "components/sync-status/SyncStatus";
import {
    FillingTimetable,
    GroupAvailabilityTimetable,
} from "components/timetable";
import { BASE_URL } from "constants/url";
import { AuthContext } from "contexts/auth-context";
import { EventContext, eventReducer } from "contexts/event-context";
import { AnimatePresence, motion } from "framer-motion";
import { EMPTY_EVENT, onEventChange, updateEventName } from "models/event";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { debounce } from "utils/debounce";
import { spawnNotification } from "utils/notifications";
import styles from "./[eventId].module.scss";

const EventPage: NextPage = () => {
    const router = useRouter();

    const eventNameInput = useRef<HTMLInputElement>(null);

    // Using context and reducer together to allow for descendants to cleanly
    // modify the local single source of truth for the event's data.
    const [eventState, eventDispatch] = useReducer(eventReducer, EMPTY_EVENT);
    const cachedEventContext = useMemo(
        () => ({ eventState, eventDispatch }),
        [eventState, eventDispatch],
    );

    // User auth state.
    const { authState, authDispatch } = useContext(AuthContext);

    // Sync status of each input component.
    const [updateEventNameStatus, setUpdateEventNameStatus] =
        useState<Status>(null);
    const [updateDatesStatus, setUpdateDatesStatus] = useState<Status>(null);
    const [updateTimetableStatus, setUpdateTimetableStatus] =
        useState<Status>(null);

    // Get the event's ID from the route.
    const eventId = useMemo(
        () => (router.query.eventId ? String(router.query.eventId) : ""),
        [router],
    );

    // At least one date has been selected.
    const dateSelected = useMemo(
        () =>
            eventState?.groupAvailabilities &&
            Object.keys(eventState.groupAvailabilities).length > 0,
        [eventState],
    );

    // Whether the current member of the event (after signing in) is an owner.
    const isOwner = useMemo(
        () =>
            authState.username &&
            authState.username in eventState.members &&
            eventState.members[authState.username].isOwner,
        [authState, eventState],
    );

    // Updates the remote event's name, n milliseoncds after the user's last
    // input. This is done to limit the rate of requests sent to the remote
    // Firebase instance.
    const debouncedUpdateEventName = useMemo(
        () =>
            debounce((payload: { eventId: string; newVal: any }) => {
                const { newVal, eventId } = payload;
                if (!newVal) {
                    spawnNotification("error", "Event name must not be empty.");
                    setUpdateEventNameStatus("failure");
                    return;
                }
                updateEventName(eventId, newVal)
                    .then(() => {
                        setUpdateEventNameStatus("success");
                    })
                    .catch((err) => {
                        spawnNotification("error", err.message);
                        setUpdateEventNameStatus("failure");
                    });
            }, 1000),
        [],
    );

    // Fetch and listen for changes to the remote Event data object.
    useEffect(() => {
        if (!(eventId && eventDispatch)) return;
        try {
            onEventChange(
                eventId,
                (newEvent) =>
                    eventDispatch({
                        type: "SET_EVENT",
                        payload: { event: newEvent },
                    }),
                router,
            );
        } catch (err) {
            spawnNotification("error", (err as Error).message);
        }
    }, [eventId, eventDispatch, router]);

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

            debouncedUpdateEventName({ eventId, newVal: e.target.value });
        },
        [
            eventId,
            setUpdateEventNameStatus,
            eventState,
            debouncedUpdateEventName,
        ],
    );

    const up = useMemo(
        () => (status: Status) => setUpdateTimetableStatus(status),
        [setUpdateTimetableStatus],
    );

    return (
        <>
            <Head>
                <title>{eventState?.name}</title>
            </Head>
            <PageTransition>
                <EventContext.Provider value={cachedEventContext}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            style={{
                                padding: "24px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                minHeight: "calc(100vh - 56px - 38px)",
                            }}
                        >
                            <div className={styles.main}>
                                {/* TODO: refactor event credentials management. */}
                                {!authState.username && (
                                    <EventSignIn eventId={eventId} />
                                )}
                                {isOwner && (
                                    <div>
                                        <div
                                            className={
                                                styles.eventNameContainer
                                            }
                                        >
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
                                            <SyncStatus
                                                status={updateEventNameStatus}
                                            />
                                        </div>
                                        <div className={styles.header}>
                                            <h2>
                                                What days could the event
                                                happen?
                                            </h2>
                                            <p>
                                                Click and drag the dates below
                                                to select which days to consider
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
                                                updateStatus={(
                                                    status: Status,
                                                ) =>
                                                    setUpdateDatesStatus(status)
                                                }
                                            />
                                        </div>
                                        <SyncStatus
                                            status={updateDatesStatus}
                                        />
                                        <div style={{ marginTop: "48px" }} />
                                        {!dateSelected && (
                                            <Callout Icon={InfoIcon}>
                                                Please select at least 1 date to
                                                begin.
                                            </Callout>
                                        )}
                                    </div>
                                )}
                                {dateSelected && (
                                    <div className={styles.timetableContainer}>
                                        {/* Timetable for filling availabilities. */}
                                        <div
                                            style={{
                                                overflow: "auto",
                                                paddingBottom: "100px",
                                            }}
                                        >
                                            <FillingTimetable
                                                username={authState.username}
                                                eventId={eventId}
                                                updateStatus={up}
                                            />
                                            <SyncStatus
                                                status={updateTimetableStatus}
                                            />
                                        </div>
                                        {/* Timetable for showing the group's availabilities */}
                                        <GroupAvailabilityTimetable
                                            username={authState.username}
                                            eventId={eventId}
                                        />
                                    </div>
                                )}
                                {!dateSelected && !isOwner && (
                                    <Callout Icon={InfoIcon}>
                                        Hmm... the organiser hasn&apos;t picked
                                        any days yet. Try again later.
                                    </Callout>
                                )}
                                <section className={styles.header}>
                                    {dateSelected && (
                                        <>
                                            <h2>
                                                Share this link with others.
                                            </h2>
                                            <p style={{ marginBottom: "24px" }}>
                                                Wait for them to fill in their
                                                availabilities and then pick the
                                                time that works best.
                                            </p>

                                            <ShareableLink
                                                link={`${BASE_URL}/events/${eventId}`}
                                            />
                                        </>
                                    )}

                                    {/* <h2 style={{ marginTop: "24px" }}>
                                How was the planning experience?
                            </h2> */}
                                </section>
                            </div>
                            <section
                                className={`${styles.header} ${styles.featureRequest}`}
                            >
                                <h2>Want to see a new feature?</h2>
                                <p style={{ marginBottom: "24px" }}>
                                    Request one in less than 1 minute.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.push("/feature-request")
                                    }
                                >
                                    Request Feature
                                </Button>
                            </section>
                        </motion.div>
                    </AnimatePresence>
                </EventContext.Provider>
            </PageTransition>
        </>
    );
};

export default EventPage;
