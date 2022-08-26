import React, {
    Dispatch,
    FormEvent,
    SetStateAction,
    useCallback,
    useRef,
} from "react";

interface Props {
    setUsername: Dispatch<SetStateAction<string>>;
    setPassword: Dispatch<SetStateAction<string>>;
}

const EventSignIn: React.FC<Props> = ({ setUsername, setPassword }) => {
    const usernameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    /**
     * Sets the credentials of the user who's trying to fill out the timetable.
     */
    const setCredentials = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            if (usernameInput.current) setUsername(usernameInput.current.value);
            if (passwordInput.current) setPassword(passwordInput.current.value);
        },
        [setUsername, setPassword, usernameInput, passwordInput],
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
