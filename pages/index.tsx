import type { NextPage } from "next";
import Link from "next/link";
import Logo from "public/logo.svg";
import styles from "./index.module.scss";

const Home: NextPage = () => {
    return (
        <div>
            <h1 className={styles.heading}>
                <span aria-label="Application name" className={styles.appName}>
                    Konflux
                </span>{" "}
                <Logo className={styles.logo} />
            </h1>
            <aside className={styles.slogan}>Painless meetup planning.</aside>
            <aside className={styles.featureRequest}>
                <Link href="/request">Request a feature.</Link>
            </aside>
            <Link href="/new">
                <button>Start planning</button>
            </Link>
            <Link href="/events">
                <button>See your events</button>
            </Link>
        </div>
    );
};

export default Home;
