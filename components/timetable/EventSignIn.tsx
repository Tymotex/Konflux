import React from "react";

interface Props {}

const EventSignIn: React.FC<Props> = () => {
    return (
        <form style={{ margin: "0 auto", width: "fit-content" }}>
            <div>
                <label htmlFor="event-username">Who are you?</label>
                <input
                    id="event-username"
                    type="text"
                    placeholder="Eg. Linus Torvalds"
                />
            </div>
            <div>
                <label htmlFor="event-password">Password (optional)</label>
                <input id="event-password" type="password" />
            </div>
        </form>
    );
};

export default EventSignIn;
