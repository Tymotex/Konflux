import ArrowDownIcon from "assets/icons/arrow-down.svg";
import CheckIcon from "assets/icons/check.svg";
import { Button } from "components/button";
import { EventCreationForm } from "components/form";
import { PageTransition } from "components/page-transition";
import { motion } from "framer-motion";
import { useClearAuthOnPageMount } from "hooks/event";
import { useLocalStorageEvents } from "hooks/local-event";
import { useDarkMode } from "hooks/theme";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useGlobalUser } from "utils/global-auth";
import styles from "./index.module.scss";

const Home: NextPage = () => {
    const isDarkMode = useDarkMode();
    const globalUser = useGlobalUser();
    const router = useRouter();
    const localStorageEvents = useLocalStorageEvents();

    useClearAuthOnPageMount();

    /**
     * Note: The homepage renders an event creation form directly. This form
     *       is different only if the user is globally authenticated.
     */
    return (
        <>
            <Head>
                <title>Konflux</title>
            </Head>
            <PageTransition>
                <div className={styles.container}>
                    <motion.header
                        className={`${styles.header} ${
                            isDarkMode ? styles.dark : ""
                        }`}
                        variants={entryAnimVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className={styles.tagline}>
                            A minimal web app for planning meetups.
                        </h2>
                        {globalUser ||
                        (localStorageEvents &&
                            localStorageEvents.length > 0) ? (
                            <>
                                <Button
                                    colour="secondary"
                                    size="sm"
                                    onClick={() => router.push("/events")}
                                >
                                    View Events
                                </Button>
                            </>
                        ) : (
                            <ul className={styles.features}>
                                <li>
                                    <CheckIcon className={styles.check} /> Plan
                                    meetups in 1 minute.
                                </li>
                                <li>
                                    <CheckIcon className={styles.check} />
                                    100% free service.
                                </li>
                                <li>
                                    <CheckIcon className={styles.check} />
                                    <strong>No registration required</strong>
                                </li>
                            </ul>
                        )}
                    </motion.header>
                    <main className={styles.main}>
                        <motion.div
                            className={styles.callToAction}
                            initial="hidden"
                            animate="visible"
                            variants={entryAnimVariants}
                        >
                            <h2>Start Here</h2>
                            <motion.span
                                animate={{ y: [0, 4, 0, -4, 0] }}
                                transition={{
                                    ease: "linear",
                                    duration: 0.75,
                                    delay: 2.5,
                                    repeat: 2,
                                }}
                            >
                                <ArrowDownIcon
                                    className={`${styles.arrowIcon} ${
                                        isDarkMode ? styles.dark : ""
                                    }`}
                                />
                            </motion.span>
                        </motion.div>
                        <motion.div
                            className={styles.startForm}
                            variants={homepageAnimatedContainer}
                            initial={"hidden"}
                            animate="show"
                        >
                            <EventCreationForm />
                        </motion.div>
                    </main>
                </div>
            </PageTransition>
        </>
    );
};

/* ------------------------- Framer Motion Variants ------------------------- */
const homepageAnimatedContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            delay: 0.75,
            delayChildren: 0.75,
            staggerChildren: 0.25,
        },
    },
};

export const homepageAnimatedItem = {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0, transition: { duration: 1 } },
};

const entryAnimVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
};

export default Home;
