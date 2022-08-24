import { Container } from "components/container";
import { DaySelector } from "components/day-selector";
import { PageTransition } from "components/page-transition";
import { Timetable } from "components/timetable";
import {
    createIntervals,
    FilledSchedule,
} from "components/timetable/timetable-utils";
import { AnimatePresence, motion } from "framer-motion";
import { createEvent, syncEventDays } from "models/event";
import type { NextPage } from "next";
import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AiOutlineArrowRight as ArrowRight } from "react-icons/ai";

const Home: NextPage = () => {
    const eventNameInput = useRef<HTMLInputElement>(null);

    // The ID of the event after creation.
    const [eventId, setEventId] = useState<string>("");

    // An unordered set of date strings of the universal ISO format "YYYY-MM-DD"
    // selected by the user.
    const [selectedDays, setSelectedDays] = useState<Set<string>>(
        new Set<string>(),
    );

    // A map structure containing a superset of the days on the timetable grid
    // and the availabilities filled by the user.
    const [selectedBlocks, setSelectedBlocks] = useState<FilledSchedule>({});

    const timeIntervals = useMemo(
        () => createIntervals(selectedDays),
        [selectedDays],
    );

    // Whenever the organiser sets a different set of days, sync those changes
    // with the remote copy.
    useEffect(() => {
        syncEventDays(eventId, timeIntervals);
        // TODO: this would be a good place to update the state for a 'saved' status UI.
    }, [timeIntervals, eventId]);

    // Whenever the organiser changes their timetable availabilities, sync those
    // changes with the remote copy.
    useEffect(() => {}, [selectedBlocks]);

    // Handle the creation of an event.
    const handleEventCreation = useCallback((e: FormEvent) => {
        e.preventDefault();

        if (eventNameInput.current === null) {
            // TODO: Notification.
            alert("ERROR");
            return;
        }

        const formEventName = String(eventNameInput.current.value);
        if (formEventName.length === 0) {
            alert("Event name must not be empty.");
            return;
        }
        // TODO: handle max event name length.

        // Creating the event in Firebase realtime DB.
        const eventId = createEvent(formEventName);
        setEventId(eventId);
        // TODO: push to localstorage the event. Write a simple API for this.
    }, []);

    return (
        <PageTransition>
            <Container>
                <AnimatePresence mode="wait">
                    {!eventId ? (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleEventCreation}
                            // TODO: remove this:
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translateX(-50%) translateY(-50%)",
                            }}
                        >
                            <label htmlFor="event-name">
                                What&apos;s the event?
                            </label>
                            <input
                                ref={eventNameInput}
                                id="event-name"
                                type="text"
                                placeholder="Eg.Math group study"
                            />
                            <button type="submit">
                                <ArrowRight />
                            </button>
                        </motion.form>
                    ) : (
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
                            />
                            <div>
                                Share with invitees the link:{" "}
                                <strong>{`http://localhost:3000/events/${eventId}`}</strong>
                            </div>
                            <DaySelector
                                selectedDays={selectedDays}
                                setSelectedDays={setSelectedDays}
                            />
                            <Timetable
                                timeIntervals={timeIntervals}
                                selectedBlocks={selectedBlocks}
                                setSelectedBlocks={setSelectedBlocks}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </PageTransition>
    );
};

export default Home;
