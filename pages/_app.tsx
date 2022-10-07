// Initialises the Firebase SDK for use.
import "utils/firebaseInit";

import "@reach/tooltip/styles.css";
import "@reach/dialog/styles.css";
import { PageLayout } from "components/layout";
import { NotificationContainer } from "components/notification";
import { ThemeProvider } from "contexts/ThemeProvider";
import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.scss";
import {
    AuthContext,
    authReducer,
    EMPTY_AUTH_STATE,
} from "contexts/auth-context";
import { useMemo, useReducer } from "react";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    const [authState, authDispatch] = useReducer(authReducer, EMPTY_AUTH_STATE);
    const cachedAuthContext = useMemo(
        () => ({ authState, authDispatch }),
        [authState, authDispatch],
    );

    return (
        <>
            <ThemeProvider>
                <PageLayout>
                    <AuthContext.Provider value={cachedAuthContext}>
                        <AnimatePresence
                            mode="wait"
                            onExitComplete={() => window.scrollTo(0, 0)}
                        >
                            <Component {...pageProps} key={router.route} />
                        </AnimatePresence>
                        <NotificationContainer />
                    </AuthContext.Provider>
                </PageLayout>
            </ThemeProvider>
        </>
    );
}

export default MyApp;
