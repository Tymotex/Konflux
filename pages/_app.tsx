import "../styles/globals.scss";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import "utils/firebaseInit";
import { connectToLocalEmulator } from "utils/firebaseInit";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        if (location.hostname === "localhost") {
            connectToLocalEmulator();
        }
    }, []);

    return (
        <>
            <AnimatePresence
                mode="wait"
                onExitComplete={() => window.scrollTo(0, 0)}
            >
                <Component {...pageProps} key={router.route} />
            </AnimatePresence>
            <ToastContainer />
        </>
    );
}

export default MyApp;
