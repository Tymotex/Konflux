import { Container } from "components/container";
import { DaySelector } from "components/day-selector";
import { PageTransition } from "components/page-transition";
import { Timetable } from "components/timetable";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { FormEvent, useCallback, useRef, useState } from "react";
import { AiOutlineArrowRight as ArrowRight } from "react-icons/ai";

const Home: NextPage = () => {
    const eventNameInput = useRef<HTMLInputElement>(null);
    const [eventCreated, setEventCreated] = useState<boolean>(false);

    // An unordered set of date strings of the universal ISO format "YYYY-MM-DD"
    // selected by the user.
    const [selectedDays, setSelectedDays] = useState<Set<string>>(
        new Set<string>(),
    );

    // Handle the creation of an event.
    const createEvent = useCallback((e: FormEvent) => {
        e.preventDefault();

        if (eventNameInput.current === null) {
            // TODO: Notification.
            alert("ERROR");
            return;
        }

        const eventName = String(eventNameInput.current.value);
        if (eventName.length === 0) {
            alert("Event name must not be empty.");
            return;
        }

        setEventCreated(true);
        // TODO: Invoke firebase event creation
    }, []);

    return (
        <PageTransition>
            <Container>
                <AnimatePresence mode="wait">
                    {!eventCreated ? (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={createEvent}
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
                            // TODO: remove or move:
                            // style={{
                            //     position: "absolute",
                            //     top: "50%",
                            //     left: "50%",
                            //     transform: "translateX(-50%) translateY(-50%)",
                            // }}
                        >
                            <label htmlFor="event-name">Event Name</label>
                            <input
                                ref={eventNameInput}
                                id="event-name"
                                type="text"
                                placeholder="Eg. Math group study"
                            />
                            <DaySelector
                                selectedDays={selectedDays}
                                setSelectedDays={setSelectedDays}
                            />
                            <ul>
                                {Array.from(selectedDays).map((date) => (
                                    <li key={date}>{date}</li>
                                ))}
                            </ul>
                            <Timetable />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </PageTransition>
    );
};

export default Home;
