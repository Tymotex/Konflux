import "../styles/globals.scss";
import "components/day-selector/DaySelector.scss";
import type { AppProps } from "next/app";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    return (
        <AnimatePresence
            mode="wait"
            onExitComplete={() => window.scrollTo(0, 0)}
        >
            <Component {...pageProps} key={router.route} />
        </AnimatePresence>
    );
}

export default MyApp;
