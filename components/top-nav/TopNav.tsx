import React from "react";
import Logo from "public/logo.svg";
import styles from "./TopNav.module.scss";
import { DarkModeToggle } from "components/dark-mode-toggle";

interface Props {}

const TopNav: React.FC<Props> = () => {
    return (
        <nav className={styles.topnav}>
            <div className={styles.navContentsContainer}>
                <h1 className={styles.brand}>
                    <Logo className={styles.brandIcon} />
                    <span
                        aria-label="Application name"
                        className={styles.brandName}
                    >
                        Konflux.
                    </span>
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
