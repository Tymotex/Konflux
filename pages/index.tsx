import { Button } from "components/button";
import { PageTransition } from "components/page-transition";
import { createEvent } from "models/event";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "public/logo.svg";
import { useCallback, useRef } from "react";
import { AiOutlineArrowRight as ArrowRight } from "react-icons/ai";
import {
    spawnNotification,
    spawnPromiseNotification,
} from "utils/notifications";
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

            // TODO: push to localstorage the event. Write a simple API for this.

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
            <h1 className={styles.heading}>
                <span aria-label="Application name" className={styles.appName}>
                    Konflux
                </span>{" "}
                <Logo className={styles.logo} />
            </h1>
            <aside className={styles.slogan}>Painless meetup planning.</aside>
            <aside className={styles.featureRequest}>
                <Link scroll={false} href="/feature-request">
                    Request a feature.
                </Link>
            </aside>
            <div className={styles.callToAction}>
                <div>
                    <h2>Start Planning</h2>
                    <div>
                        <label htmlFor="event-name">Event Name:</label>
                        <input
                            ref={eventNameInput}
                            id="event-name"
                            type="text"
                            placeholder="Eg. Dinner with Linus Torvalds"
                        />
                    </div>
                    <div>
                        <label htmlFor="username">Your name:</label>
                        <input
                            ref={usernameInput}
                            id="username"
                            type="text"
                            placeholder="Eg. Linus Torvalds"
                        />
                    </div>
                    <div>
                        <label htmlFor="password">(Optional) Password:</label>
                        <input
                            ref={passwordInput}
                            id="password"
                            type="password"
                        />
                    </div>
                    <Button
                        text="Start Planning"
                        shape="pill"
                        size="md"
                        icon={<ArrowRight />}
                        iconInset
                        onClick={() =>
                            spawnPromiseNotification(handleEventCreation, {
                                pendingMessage: "Creating a new event.",
                                successMessage: "Created a new event.",
                            })
                        }
                    />
                </div>
                <Button
                    text="See Your Events"
                    colour="secondary"
                    shape="pill"
                />
            </div>
        </PageTransition>
    );
};

export default Home;
