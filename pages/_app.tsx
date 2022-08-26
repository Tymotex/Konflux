// Initialises the Firebase SDK for use.
import "utils/firebaseInit";

import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    return (
        <>
            <AnimatePresence
                mode="wait"
                onExitComplete={() => window.scrollTo(0, 0)}
            >
                <Component {...pageProps} key={router.route} />
            </AnimatePresence>
            <ToastContainer theme="dark" position="top-center" />
        </>
    );
}

export default MyApp;
