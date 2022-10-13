import {
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogLabel,
    AlertDialogOverlay,
} from "@reach/alert-dialog";
import { Button } from "components/button";
import { Callout } from "components/callout";
import IdeaIcon from "components/callout/idea.svg";
import { TextField } from "components/form";
import { EventContext } from "contexts/event-context";
import { LocalAuthAction } from "contexts/local-auth-context";
import { useDarkMode } from "contexts/ThemeProvider";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
    Dispatch,
    useCallback,
    useContext,
    useMemo,
    useRef,
} from "react";
import BackIcon from "./back.svg";
import styles from "./EventSignIn.module.scss";

interface Props {
    eventId: string;
    onSubmitSuccess?: (username: string, password: string) => void;
    localAuthDispatch: Dispatch<LocalAuthAction>;
}

const MotionOverlay = motion(AlertDialogOverlay);

const EventSignIn: React.FC<Props> = ({
    eventId,
    onSubmitSuccess = () => {},
    localAuthDispatch,
}) => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const router = useRouter();

    const isDarkMode = useDarkMode();

    const backBtnRef = useRef<HTMLButtonElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const allLocalMembers = useMemo(() => {
        return new Set(
            Object.keys(eventState?.members || {}).filter(
                (member) => eventState.members[member].scope === "local",
            ),
        );
    }, [eventState]);

    /**
     * Submit form and dispatch either a login or register request to populate
     * the local auth context.
     */
    const locallyAuthenticate = useCallback(() => {
        if (!usernameInputRef.current)
            throw new Error("Username input ref detached");
        if (!passwordInputRef.current)
            throw new Error("Password input ref detached");

        const username = usernameInputRef.current.value;
        const password = passwordInputRef.current.value;

        // If this user is already a member, attempt to dispatch a login,
        // otherwise directly attempt to create them as a new user.
        localAuthDispatch({
            type:
                username in eventState.members
                    ? "LOCAL_SIGN_IN"
                    : "LOCAL_SIGN_UP",
            payload: {
                event: eventState,
                username,
                localPassword: password,
            },
        });

        onSubmitSuccess(username, password);
    }, [
        eventState,
        usernameInputRef,
        passwordInputRef,
        localAuthDispatch,
        onSubmitSuccess,
    ]);

    return (
        <AnimatePresence mode="wait">
            <MotionOverlay
                leastDestructiveRef={backBtnRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <AlertDialogContent
                    className={`${styles.container} ${
                        isDarkMode ? styles.dark : ""
                    }`}
                >
                    <div className={styles.content}>
                        <button
                            ref={backBtnRef}
                            className={styles.backBtn}
                            onClick={() => router.push("/")}
                        >
                            <BackIcon className={styles.icon} />
                            Back Home
                        </button>

                        <AlertDialogLabel className={styles.headingText}>
                            Who are you?
                        </AlertDialogLabel>

                        <div className={styles.form}>
                            <TextField
                                id="event-username"
                                refHandle={usernameInputRef}
                                label="Event Username"
                                autocompleteItems={allLocalMembers}
                                placeholder="E.g. Linus Torvalds"
                                infoText="The username you used when you registered to this event."
                                required
                            />
                            <TextField
                                id="event-password"
                                label="Event Password"
                                refHandle={passwordInputRef}
                                type="password"
                                infoText="Leave empty if you didn't set a password when you registered to this event."
                            />
                            <Button
                                onClick={() => {
                                    locallyAuthenticate();
                                }}
                            >
                                Submit
                            </Button>
                        </div>

                        <AlertDialogDescription className={styles.description}>
                            <Callout Icon={IdeaIcon}>
                                <strong>
                                    <Link href="/?login=true">Log in</Link>
                                </strong>{" "}
                                or{" "}
                                <strong>
                                    <Link href="/?register=true">
                                        create an account
                                    </Link>
                                </strong>{" "}
                                so we don&apos;t have to ask you who you are
                                every time.
                            </Callout>
                        </AlertDialogDescription>
                    </div>
                </AlertDialogContent>
            </MotionOverlay>
        </AnimatePresence>
    );
};

export default EventSignIn;
