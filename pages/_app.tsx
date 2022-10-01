// Initialises the Firebase SDK for use.
import "utils/firebaseInit";

import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.scss";
import { TopNav } from "components/top-nav";
import { PageLayout } from "components/layout";
import "@reach/tooltip/styles.css";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    return (
        <>
            <PageLayout>
                <AnimatePresence
                    mode="wait"
                    onExitComplete={() => window.scrollTo(0, 0)}
                >
                    <Component {...pageProps} key={router.route} />
                </AnimatePresence>
                <ToastContainer
                    position="top-center"
                    hideProgressBar
                    pauseOnFocusLoss={false}
                />
            </PageLayout>
        </>
    );
}

export default MyApp;
