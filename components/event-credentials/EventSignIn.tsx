import {
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogLabel,
    AlertDialogOverlay,
} from "@reach/alert-dialog";
import { AuthContext } from "contexts/auth-context";
import { EventContext } from "contexts/event-context";
import React, {
    FormEvent,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import styles from "./EventSignIn.module.scss";
import BackIcon from "./back.svg";
import { useDarkMode } from "contexts/ThemeProvider";
import { Button } from "components/button";
import { AutocompleteField, TextField } from "components/form";
import { useModalLayoutShiftFix } from "hooks/modal";
import { useRouter } from "next/router";
import { Callout } from "components/callout";
import IdeaIcon from "components/callout/idea.svg";
import Link from "next/link";

interface Props {
    eventId: string;
}

const EventSignIn: React.FC<Props> = ({ eventId }) => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const { authState, authDispatch } = useContext(AuthContext);
    const router = useRouter();

    const isDarkMode = useDarkMode();

    useModalLayoutShiftFix(true);

    const backBtnRef = useRef<HTMLButtonElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const allMembers = new Set(Object.keys(eventState?.members || {}));

    const authenticate = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            if (!usernameInputRef.current)
                throw new Error("Username input ref detached");
            if (!passwordInputRef.current)
                throw new Error("Password input ref detached");

            const username = usernameInputRef.current.value;
            const password = passwordInputRef.current.value;

            // If this user is already a member, attempt to dispatch a login,
            // otherwise directly attempt to create them as a new user.
            if (username in eventState.members) {
                authDispatch({
                    type: "LOCAL_LOGIN",
                    payload: {
                        event: eventState,
                        username,
                        localPassword: password,
                    },
                });
            } else {
                authDispatch({
                    type: "LOCAL_REGISTER",
                    payload: {
                        eventId,
                        event: eventState,
                        eventDispatch,
                        username,
                        localPassword: password,
                    },
                });
            }
        },
        [eventId, eventState, authDispatch, usernameInputRef, passwordInputRef],
    );

    return (
        <AlertDialogOverlay
            leastDestructiveRef={backBtnRef}
            style={{
                background: "hsl(0, 100%, 0%, 0.5)",
                backdropFilter: "blur(2px)",
                zIndex: 10000,
            }}
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

                    <form onSubmit={authenticate} className={styles.form}>
                        <TextField
                            id="event-username"
                            refHandle={usernameInputRef}
                            label="Event Username"
                            autocompleteItems={allMembers}
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
                        <Button isSubmit>Submit</Button>
                    </form>

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
                            so we don't have to ask you who you are every time.
                        </Callout>
                    </AlertDialogDescription>
                </div>
            </AlertDialogContent>
        </AlertDialogOverlay>
    );
};

export default EventSignIn;
