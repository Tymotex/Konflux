import { Button } from "components/button";
import { TextField } from "components/form";
import { PageTransition } from "components/page-transition";
import { TopNav } from "components/top-nav";
import { createEvent } from "models/event";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useRef } from "react";
import { spawnNotification } from "utils/notifications";
import ArrowDownIcon from "./arrow-down.svg";
import Check from "./check.svg";
import styles from "./index.module.scss";

const Home: NextPage = () => {
    const router = useRouter();
    const eventNameInput = useRef<HTMLInputElement>(null);
    const usernameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    // Handle the creation of an event.
    const handleEventCreation = useCallback(async (): Promise<void> => {
        if (
            eventNameInput.current === null ||
            usernameInput.current === null ||
            passwordInput.current === null
        ) {
            spawnNotification("error", "Input element references detached!");
            spawnNotification("error", `${eventNameInput.current === null}`);
            return;
        }

        // Get and validate the event name.
        const formEventName = String(eventNameInput.current.value);
        if (formEventName.length === 0) {
            throw new Error("Event name must not be empty.");
        } else if (formEventName.length >= 255) {
            throw new Error("Event name must be fewer than 255 characters.");
        }

        // Get and validate the username and password
        const formUsername = String(usernameInput.current.value);
        const formPassword = String(passwordInput.current.value);
        if (formUsername.length === 0) {
            throw new Error("Username is required.");
        } else if (formUsername.length >= 255) {
            throw new Error("Username must be fewer than 255 characters.");
        }
        if (formPassword.length >= 64) {
            throw new Error("Password must be fewer than 64 characters.");
        }

        try {
            // Creating the event in Firebase realtime DB.
            const eventId = await createEvent(formEventName, formUsername);

            // Transmit username and password to the event details page so that it
            // need not be fetched and verified.
            router.push({
                pathname: `/events/${eventId}`,
                query: {
                    username: formUsername,
                    password: formPassword,
                },
            });
        } catch (err) {
            if (err instanceof Error) spawnNotification("error", err.message);
            else throw err;
        }
    }, [router]);

    return (
        <PageTransition>
            <TopNav />
            <header className={styles.header}>
                <h2 className={styles.tagline}>
                    A minimal web app for planning meetups.
                </h2>
                <ul className={styles.features}>
                    <li>
                        <Check className={styles.check} /> Plan meetups in 1
                        minute.
                    </li>
                    <li>
                        <Check className={styles.check} />
                        100% free service.
                    </li>
                    <li>
                        <Check className={styles.check} />
                        <strong>No registration required</strong>
                    </li>
                </ul>
            </header>
            <div className={styles.main}>
                <div className={styles.callToAction}>
                    <h2>Start Here</h2>
                    <ArrowDownIcon className={styles.arrowIcon} />
                </div>
                <TextField
                    refHandle={eventNameInput}
                    id={"event-name"}
                    placeholder={"Dinner with Linus Torvalds"}
                    required
                    label={"Event Name"}
                />
                <TextField
                    refHandle={usernameInput}
                    id={"username"}
                    placeholder={"Linus Torvalds"}
                    required
                    label={"Username"}
                    infoText={"A name that others can recognise you by."}
                />
                <TextField
                    refHandle={passwordInput}
                    id={"password"}
                    type={"password"}
                    label={"Password"}
                    infoText={
                        "An optional password you can set so that only you can modify the event."
                    }
                />
                <Button onClick={handleEventCreation}>Start</Button>
            </div>
        </PageTransition>
    );
};

export default Home;
