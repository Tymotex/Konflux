import React from "react";
import Logo from "public/logo.svg";
import styles from "./TopNav.module.scss";
import { DarkModeToggle } from "components/dark-mode-toggle";
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {}

const TopNav: React.FC<Props> = () => {
    const router = useRouter();

    return (
        <nav className={styles.topnav}>
            <div className={styles.navContentsContainer}>
                <h1 className={styles.brand}>
                    <Logo
                        className={styles.brandIcon}
                        onClick={() => router.push("/")}
                    />
                    <Link href="/">
                        <a
                            aria-label="Application name"
                            className={styles.brandName}
                        >
                            Konflux.
                        </a>
                    </Link>
                </h1>
                <div className={styles.utilitiesContainer}>
                    <DarkModeToggle />
                    <button className={styles.login}>Login</button>
                    <button className={styles.register}>Register</button>
                </div>
            </div>
        </nav>
    );
};

export default TopNav;
