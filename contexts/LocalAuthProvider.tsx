import React, { useMemo, useReducer } from "react";
import {
    EMPTY_EVENT_USER,
    LocalAuthContext,
    localAuthReducer,
} from "./local-auth-context";

interface Props {
    children: React.ReactNode;
}

export const LocalAuthProvider: React.FC<Props> = ({ children }) => {
    const [localAuthState, localAuthDispatch] = useReducer(
        localAuthReducer,
        EMPTY_EVENT_USER,
    );
    const cachedAuthContext = useMemo(
        () => ({ localAuthState, localAuthDispatch }),
        [localAuthState, localAuthDispatch],
    );

    return (
        <LocalAuthContext.Provider value={cachedAuthContext}>
            {children}
        </LocalAuthContext.Provider>
    );
};
