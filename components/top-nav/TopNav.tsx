import React, { useCallback, useEffect, useState } from "react";
import LogoLight from "public/logo-light.svg";
import LogoDark from "public/logo-dark.svg";
import styles from "./TopNav.module.scss";
import { DarkModeToggle } from "components/dark-mode-toggle";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDarkMode } from "contexts/ThemeProvider";
import { Dialog } from "@reach/dialog";
import { LoginModal, RegisterModal } from "components/authentication";
import { getProfilePicUrl, getUserName } from "utils/auth";
import { getAuth, onAuthStateChanged } from "@firebase/auth";

interface Props {}

const TopNav: React.FC<Props> = () => {
    const router = useRouter();
    const isDarkMode = useDarkMode();

    const [signedIn, setSignedIn] = useState(false);

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

    useEffect(() => {
        // If at the homepage and either the login or register query parameter
        // was supplied, open the corresponding modal.
        const { login, register } = router.query;
        if (router.pathname === "/") {
            if (login) {
                setTimeout(() => {
                    openLoginModal();
                    closeRegisterModal();
                }, 1000);
            } else if (register) {
                setTimeout(() => {
                    openRegisterModal();
                    closeLoginModal();
                }, 1000);
            }
        }
    }, [
        router,
        closeLoginModal,
        closeRegisterModal,
        openLoginModal,
        openRegisterModal,
    ]);

    useEffect(() => {
        onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                setSignedIn(true);
            }
        });
    }, [setSignedIn]);

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
                    {!signedIn ? (
                        <>
                            <LoginModal
                                isOpen={loginIsOpen}
                                onDismiss={closeLoginModal}
                            />
                            <button
                                className={styles.login}
                                onClick={openLoginModal}
                            >
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
                        </>
                    ) : (
                        <>
                            <img
                                src={getProfilePicUrl()}
                                style={{ height: "24px", width: "24px" }}
                            />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopNav;
