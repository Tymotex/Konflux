// Initialises the Firebase SDK for use.
import "utils/firebaseInit";

import "@reach/tooltip/styles.css";
import "@reach/dialog/styles.css";
import "@reach/combobox/styles.css";
import "@reach/menu-button/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { PageLayout } from "components/layout";
import { NotificationContainer } from "components/notification";
import { ThemeProvider } from "contexts/ThemeProvider";
import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "../styles/globals.scss";
import {
    LocalAuthContext,
    localAuthReducer,
    EMPTY_EVENT_USER,
} from "contexts/local-auth-context";
import { useMemo, useReducer } from "react";
import { ModalControlProvider } from "contexts/ModalControlProvider";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    const [localAuthState, localAuthDispatch] = useReducer(
        localAuthReducer,
        EMPTY_EVENT_USER,
    );
    const cachedAuthContext = useMemo(
        () => ({ localAuthState, localAuthDispatch }),
        [localAuthState, localAuthDispatch],
    );

    return (
        <>
            <ThemeProvider>
                <ModalControlProvider>
                    <LocalAuthContext.Provider value={cachedAuthContext}>
                        <PageLayout>
                            <AnimatePresence
                                mode="wait"
                                onExitComplete={() => window.scrollTo(0, 0)}
                            >
                                <Component {...pageProps} key={router.route} />
                            </AnimatePresence>
                            <NotificationContainer />
                        </PageLayout>
                    </LocalAuthContext.Provider>
                </ModalControlProvider>
            </ThemeProvider>
        </>
    );
}

export default MyApp;
