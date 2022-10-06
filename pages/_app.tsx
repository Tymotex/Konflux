// Initialises the Firebase SDK for use.
import "utils/firebaseInit";

import "@reach/tooltip/styles.css";
import { PageLayout } from "components/layout";
import { NotificationContainer } from "components/notification";
import { ThemeProvider } from "contexts/ThemeProvider";
import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    return (
        <>
            <ThemeProvider>
                <PageLayout>
                    <AnimatePresence
                        mode="wait"
                        onExitComplete={() => window.scrollTo(0, 0)}
                    >
                        <Component {...pageProps} key={router.route} />
                    </AnimatePresence>
                    <NotificationContainer />
                </PageLayout>
            </ThemeProvider>
        </>
    );
}

export default MyApp;
