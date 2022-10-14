import { Button } from "components/button";
import { motion } from "framer-motion";
import { createEventAndAddOwner, KonfluxEvent } from "models/event";
import { useRouter } from "next/router";
import { homepageAnimatedItem } from "pages";
import React, { FormEventHandler, useCallback, useRef } from "react";
import { useGlobalUser } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";
import TextField from "./TextField";

interface Props {}

const EventCreationForm: React.FC<Props> = () => {
    const router = useRouter();
    const eventNameInput = useRef<HTMLInputElement>(null);
    const usernameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const globalUser = useGlobalUser();

    // Handle the creation of an event.
    const handleEventCreation: FormEventHandler<HTMLFormElement> = useCallback(
        async (e): Promise<void> => {
            e.preventDefault();

            // Get the event name.
            if (eventNameInput.current === null) {
                spawnNotification(
                    "error",
                    "Event name input reference detached!",
                );
                return;
            }
            const eventName: string = String(eventNameInput.current.value);

            // If the user is globally authenticated, we can grab the username
            // from their account details.
            // Otherwise, fallback to extracting the username and password from
            // the form for non-authenticated users.
            if (globalUser) {
                try {
                    const [eventId, event] = await createEventAndAddOwner(
                        eventName,
                        globalUser.username,
                        "TODO:wtfToDoWhenGloballyAuthed",
                        "global",
                    );
                    router.push(`/events/${eventId}`);
                } catch (err) {
                    spawnNotification("error", (err as Error).message);
                }
            } else {
                const inputRefsDetached =
                    usernameInput.current === null ||
                    passwordInput.current === null;
                if (inputRefsDetached) {
                    spawnNotification(
                        "error",
                        "Username or password input references detached!",
                    );
                    return;
                }

                const username = String(usernameInput.current.value);
                const password = String(passwordInput.current.value);
                let eventId: string | undefined;
                let event: KonfluxEvent | undefined;
                try {
                    // Creating the event in Firebase realtime DB.
                    // Note that this creates the first member in the event model
                    // and assigns them as the owner of the event.
                    [eventId, event] = await createEventAndAddOwner(
                        eventName,
                        username,
                        password,
                        "local",
                    );
                } catch (err) {
                    if (err instanceof Error)
                        spawnNotification("error", err.message);
                    else throw err;
                    return;
                }

                try {
                    if (eventId === undefined)
                        throw new Error("Event ID undefined after creation.");
                    if (event === undefined)
                        throw new Error("Event undefined after creation");

                    // Provide credentials in the URL to bypass authentication
                    // on the event page.
                    router.push(
                        `/events/${eventId}?username=${username}&password=${password}`,
                    );
                } catch (err) {
                    spawnNotification("error", (err as Error).message);
                    return;
                }
            }
        },
        [router, globalUser],
    );

    return (
        <form onSubmit={handleEventCreation}>
            <motion.div variants={homepageAnimatedItem}>
                <TextField
                    refHandle={eventNameInput}
                    id={"event-name"}
                    placeholder={"Dinner with Linus Torvalds"}
                    required
                    label={"Event Name"}
                />
            </motion.div>
            {!globalUser && (
                <>
                    <motion.div variants={homepageAnimatedItem}>
                        <TextField
                            refHandle={usernameInput}
                            id={"username"}
                            placeholder={"Linus Torvalds"}
                            required
                            label={"Username"}
                            infoText={
                                "A name that others can recognise you by."
                            }
                        />
                    </motion.div>
                    <motion.div variants={homepageAnimatedItem}>
                        <TextField
                            refHandle={passwordInput}
                            id={"password"}
                            type={"password"}
                            label={"Password"}
                            infoText={
                                "An optional password you can set so that only you can modify the event."
                            }
                        />
                    </motion.div>
                </>
            )}
            <motion.div
                variants={homepageAnimatedItem}
                style={{
                    textAlign: "center",
                    marginTop: "32px",
                }}
            >
                <Button isSubmit>Begin</Button>
            </motion.div>
        </form>
    );
};

export default EventCreationForm;
