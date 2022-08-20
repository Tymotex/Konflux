import { Button } from "components/button";
import { PageTransition } from "components/page-transition";
import { motion } from "framer-motion";
import type { NextPage } from "next";
import Link from "next/link";
import Logo from "public/logo.svg";
import styles from "./index.module.scss";
import { AiOutlineArrowRight as ArrowRight } from "react-icons/ai";

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
            <div className={styles.callToAction}>
                <Button
                    text="Start Planning"
                    internalUrl="/new"
                    shape="pill"
                    size="lg"
                    icon={<ArrowRight />}
                    iconInset
                />
                <Button
                    text="See Your Events"
                    internalUrl="/events"
                    colour="secondary"
                    shape="pill"
                >
                    See your events
                </Button>
            </div>
        </PageTransition>
    );
};

export default Home;
