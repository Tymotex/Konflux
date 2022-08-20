import "../styles/globals.scss";
import "components/day-selector/DaySelector.scss";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";

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
            <ToastContainer />
        </>
    );
}

export default MyApp;
