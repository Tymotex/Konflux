import { Container } from "components/container";
import { DaySelector } from "components/day-selector";
import { PageTransition } from "components/page-transition";
import { Timetable } from "components/timetable";
import { TimeInterval } from "components/timetable/Timetable";
import {
    createIntervals,
    extractOutSelectedDays,
    FilledSchedule,
} from "components/timetable/timetable-utils";
import { BASE_URL } from "constants/url";
import { getDatabase, onValue, ref } from "firebase/database";
import { AnimatePresence, motion } from "framer-motion";
import { KonfluxEvent, syncEventDays } from "models/event";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const EventPage: NextPage = () => {
    const router = useRouter();
    const eventNameInput = useRef<HTMLInputElement>(null);

    // Copy of the remote event.
    const [event, setEvent] = useState<KonfluxEvent>();

    // User credentials localised just to this event.
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // An unordered set of date strings of the universal ISO format "YYYY-MM-DD"
    // selected by the user.
    const [selectedDays, setSelectedDays] = useState<Set<string>>(
        new Set<string>(),
    );

    // A map structure containing a superset of the days on the timetable grid
    // and the availabilities filled by the user.
    const [selectedBlocks, setSelectedBlocks] = useState<FilledSchedule>({});

    // Form the time intervals to be passed down to the timetable for rendering.
    const [timeIntervals, setTimeIntervals] = useState<TimeInterval[]>([]);

    // Get the event's ID from the route.
    const eventId = useMemo(() => {
        return String(router.query.eventId);
    }, [router]);

    // Fetch and listen for changes to the remote Event data object.
    useEffect(() => {
        if (eventId !== undefined && eventId !== "undefined") {
            const eventRef = ref(getDatabase(), `events/${eventId}`);
            onValue(eventRef, (snapshot) => {
                const currEvent = snapshot.val();
                if (currEvent) {
                    setEvent(currEvent);

                    // Set the selected days, if they exist already:
                    if (currEvent.days) {
                        const days = extractOutSelectedDays(currEvent.days);
                        setSelectedDays(days);
                        setTimeIntervals(createIntervals(days));
                    }
                }
            });
        }
    }, [eventId]);

    // Grab the username and password transmitted through navigation from a
    // previous page. See: https://www.youtube.com/watch?v=7wzMMBRVrfw.
    useEffect(() => {
        const {
            query: { username, password },
        } = router;
        if (username) {
            setUsername(String(username));
            setPassword(String(password));
            // Clear URL query parameters. See: https://stackoverflow.com/questions/65606974/next-js-how-to-remove-query-params.
            router.replace(`/events/${eventId}`, undefined, { shallow: true });
        }
    }, [router]);

    // Whenever the organiser sets a different set of days, sync those changes
    // with the remote copy.
    const handleChange = useCallback(
        (newDays: Set<string>) => {
            setSelectedDays(newDays);
            const timeIntervals = createIntervals(newDays);
            setTimeIntervals(timeIntervals);
            syncEventDays(eventId, timeIntervals);
        },
        [timeIntervals, eventId],
    );

    // Whenever the organiser changes their timetable availabilities, sync those
    // changes with the remote copy.
    useEffect(() => {}, [selectedBlocks]);

    return (
        <PageTransition>
            <Container>
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
                            defaultValue={event?.name}
                            onChange={() => {
                                // TODO: push commit to remote.
                            }}
                        />
                        <div>
                            Share with invitees the link:{" "}
                            <strong>{`${BASE_URL}/events/${eventId}`}</strong>
                        </div>
                        <DaySelector
                            selectedDays={selectedDays}
                            // setSelectedDays={setSelectedDays}
                            handleChange={handleChange}
                        />
                        {/* Timetable for filling availabilities. */}
                        <Timetable
                            timeIntervals={timeIntervals}
                            selectedBlocks={selectedBlocks}
                            setSelectedBlocks={setSelectedBlocks}
                        />
                        {/* Timetable for showing the group's availabilities */}
                        <Timetable
                            timeIntervals={timeIntervals}
                            selectedBlocks={selectedBlocks}
                            setSelectedBlocks={setSelectedBlocks}
                            showGroupAvailability
                        />
                    </motion.div>
                </AnimatePresence>
            </Container>
        </PageTransition>
    );
};

export default EventPage;
