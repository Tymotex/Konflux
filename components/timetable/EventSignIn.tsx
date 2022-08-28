import { EventContext } from "contexts/event-context";
import React, {
    Dispatch,
    FormEvent,
    SetStateAction,
    useCallback,
    useContext,
    useRef,
} from "react";
import { spawnNotification } from "utils/notifications";

interface Props {
    eventId: string;
    setUsername: Dispatch<SetStateAction<string>>;
    setPassword: Dispatch<SetStateAction<string>>;
}

const EventSignIn: React.FC<Props> = ({
    eventId,
    setUsername,
    setPassword,
}) => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const usernameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    /**
     * Sets the credentials of the user who's trying to fill out the timetable.
     */
    const setCredentials = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            if (!eventId) {
                spawnNotification(
                    "error",
                    "Event ID is empty! Can't create member.",
                );
                return;
            }
            if (usernameInput.current) {
                const username = usernameInput.current.value;
                setUsername(username);
                console.log(eventState.members);
                if (username in eventState.members) {
                    eventDispatch({
                        type: "SIGN_IN_MEMBER",
                        payload: {
                            eventId,
                            username,
                        },
                    });
                } else {
                    eventDispatch({
                        type: "SIGN_UP_MEMBER",
                        payload: {
                            eventId,
                            username,
                        },
                    });
                }
            }
            if (passwordInput.current) setPassword(passwordInput.current.value);
        },
        [
            eventState,
            eventId,
            setUsername,
            setPassword,
            usernameInput,
            passwordInput,
        ],
    );

    return (
        <form
            onSubmit={setCredentials}
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
            {/* <div>
                <label htmlFor="event-password">Password (optional)</label>
                <input
                    ref={passwordInput}
                    id="event-password"
                    type="password"
                />
            </div> */}
            <button type="submit">Submit</button>
        </form>
    );
};

export default EventSignIn;
