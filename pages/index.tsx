import { Button } from "components/button";
import { TextField } from "components/form";
import { createEvent } from "models/event";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useRef } from "react";
import { spawnNotification } from "utils/notifications";
import ArrowDownIcon from "./arrow-down.svg";
import CheckIcon from "./check.svg";
import styles from "./index.module.scss";
import { motion } from "framer-motion";
import { useDarkMode } from "contexts/ThemeProvider";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            delay: 1,
            delayChildren: 1,
            staggerChildren: 0.5,
        },
    },
};

const item = {
    hidden: { opacity: 0, x: -100 },
    show: { opacity: 1, x: 0, transition: { duration: 1 } },
};

const entryAnimVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
};

const Home: NextPage = () => {
    const router = useRouter();
    const eventNameInput = useRef<HTMLInputElement>(null);
    const usernameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const isDarkMode = useDarkMode();

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
        <>
            <div className={styles.container}>
                <motion.header
                    className={`${styles.header} ${
                        isDarkMode ? styles.dark : ""
                    }`}
                    variants={entryAnimVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className={styles.tagline}>
                        A minimal web app for planning meetups.
                    </h2>
                    <ul className={styles.features}>
                        <li>
                            <CheckIcon className={styles.check} /> Plan meetups
                            in 1 minute.
                        </li>
                        <li>
                            <CheckIcon className={styles.check} />
                            100% free service.
                        </li>
                        <li>
                            <CheckIcon className={styles.check} />
                            <strong>No registration required</strong>
                        </li>
                    </ul>
                </motion.header>
                <main className={styles.main}>
                    <motion.div
                        className={styles.callToAction}
                        initial="hidden"
                        animate="visible"
                        variants={entryAnimVariants}
                    >
                        <h2>Start Here</h2>
                        <motion.span
                            animate={{ y: [0, 4, 0, -4, 0] }}
                            transition={{
                                ease: "linear",
                                duration: 0.75,
                                delay: 2.5,
                                repeat: 2,
                            }}
                        >
                            <ArrowDownIcon
                                className={`${styles.arrowIcon} ${
                                    isDarkMode ? styles.dark : ""
                                }`}
                            />
                        </motion.span>
                    </motion.div>
                    <motion.form
                        className={styles.startForm}
                        variants={container}
                        initial={"hidden"}
                        animate="show"
                    >
                        <motion.div variants={item}>
                            <TextField
                                refHandle={eventNameInput}
                                id={"event-name"}
                                placeholder={"Dinner with Linus Torvalds"}
                                required
                                label={"Event Name"}
                            />
                        </motion.div>
                        <motion.div variants={item}>
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
                        <motion.div variants={item}>
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
                        <motion.div
                            variants={item}
                            style={{ textAlign: "center", marginTop: "32px" }}
                        >
                            <Button onClick={handleEventCreation}>Begin</Button>
                        </motion.div>
                    </motion.form>
                </main>
            </div>
        </>
    );
};

export default Home;
