import "utils/firebaseInit";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        if (location.hostname === "localhost") {
            const connectToLocalEmulator = () => {
                // Point to the RTDB emulator running on localhost.
                // See: https://firebase.google.com/docs/emulator-suite/connect_and_prototype?database=RTDB#web-version-9.
                // const app = initializeApp(firebaseInitConfig);
                // const auth = getAuth(app);
                // const db = getDatabase(app);
                // connectDatabaseEmulator(db, "localhost", 9000);
            };
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
