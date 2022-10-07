import React, { useCallback, useState } from "react";
import LogoLight from "public/logo-light.svg";
import LogoDark from "public/logo-dark.svg";
import styles from "./TopNav.module.scss";
import { DarkModeToggle } from "components/dark-mode-toggle";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDarkMode } from "contexts/ThemeProvider";
import { Dialog } from "@reach/dialog";
import { LoginModal, RegisterModal } from "components/authentication";

interface Props {}

const TopNav: React.FC<Props> = () => {
    const router = useRouter();
    const isDarkMode = useDarkMode();

    const [registerIsOpen, setRegisterIsOpen] = useState<boolean>(false);
    const openRegisterModal = useCallback(
        () => setRegisterIsOpen(true),
        [setRegisterIsOpen],
    );
    const closeRegisterModal = useCallback(
        () => setRegisterIsOpen(false),
        [setRegisterIsOpen],
    );

    const [loginIsOpen, setLoginIsOpen] = useState<boolean>(false);
    const openLoginModal = useCallback(
        () => setLoginIsOpen(true),
        [setLoginIsOpen],
    );
    const closeLoginModal = useCallback(
        () => setLoginIsOpen(false),
        [setLoginIsOpen],
    );

    return (
        <nav className={`${styles.topnav} ${isDarkMode ? styles.dark : ""}`}>
            <div className={styles.navContentsContainer}>
                <h1 className={styles.brand}>
                    {isDarkMode ? (
                        <LogoDark
                            className={styles.brandIcon}
                            onClick={() => router.push("/")}
                        />
                    ) : (
                        <LogoLight
                            className={styles.brandIcon}
                            onClick={() => router.push("/")}
                        />
                    )}
                    <Link href="/">
                        <a
                            aria-label="Application name"
                            className={styles.brandName}
                        >
                            Konflux.
                        </a>
                    </Link>
                </h1>
                <div
                    className={`${styles.utilitiesContainer} ${
                        isDarkMode ? styles.dark : ""
                    }`}
                >
                    <DarkModeToggle />
                    <LoginModal
                        isOpen={loginIsOpen}
                        onDismiss={closeLoginModal}
                    />
                    <button className={styles.login} onClick={openLoginModal}>
                        Login
                    </button>
                    <RegisterModal
                        isOpen={registerIsOpen}
                        onDismiss={closeRegisterModal}
                    />
                    <button
                        className={styles.register}
                        onClick={openRegisterModal}
                    >
                        Register
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default TopNav;
