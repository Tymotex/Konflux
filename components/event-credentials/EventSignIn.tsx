import { AuthContext } from "contexts/auth-context";
import { EventContext } from "contexts/event-context";
import React, { FormEvent, useCallback, useContext, useRef } from "react";
import { spawnNotification } from "utils/notifications";

interface Props {
    eventId: string;
}

const EventSignIn: React.FC<Props> = ({ eventId }) => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const { authState, authDispatch } = useContext(AuthContext);

    const usernameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const authenticate = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            if (!usernameInput.current)
                throw new Error("Username input ref detached");
            if (!passwordInput.current)
                throw new Error("Username input ref detached");

            const username = usernameInput.current.value;
            const password = passwordInput.current.value;

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
        [eventId, eventState, authDispatch],
    );

    return (
        <form
            onSubmit={authenticate}
            style={{ margin: "0 auto", width: "fit-content" }}
        >
            <div>
                <label htmlFor="event-username">Who are you?</label>
                <input
                    ref={usernameInput}
                    id="event-username"
                    type="text"
                    placeholder="Eg. Linus Torvalds"
                />
            </div>
            <div>
                <label htmlFor="event-password">Password (optional)</label>
                <input
                    ref={passwordInput}
                    id="event-password"
                    type="password"
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default EventSignIn;
