import { PageTransition } from "components/page-transition";
import { motion } from "framer-motion";
import type { NextPage } from "next";
import Link from "next/link";
import Logo from "public/logo.svg";
import styles from "./index.module.scss";

const Home: NextPage = () => {
    return (
        <PageTransition>
            <h1 className={styles.heading}>
                <span aria-label="Application name" className={styles.appName}>
                    Konflux
                </span>{" "}
                <Logo className={styles.logo} />
            </h1>
            <aside className={styles.slogan}>Painless meetup planning.</aside>
            <aside className={styles.featureRequest}>
                <Link scroll={false} href="/request">
                    Request a feature.
                </Link>
            </aside>
            <Link scroll={false} href="/new">
                <button>Start planning</button>
            </Link>
            <Link scroll={false} href="/events">
                <button>See your events</button>
            </Link>
        </PageTransition>
    );
};

export default Home;
