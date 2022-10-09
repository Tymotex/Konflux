import React, { useCallback, useContext, useEffect, useState } from "react";
import LogoLight from "public/logo-light.svg";
import LogoDark from "public/logo-dark.svg";
import styles from "./TopNav.module.scss";
import { DarkModeToggle } from "components/dark-mode-toggle";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDarkMode } from "contexts/ThemeProvider";
import { Dialog } from "@reach/dialog";
import { LoginModal, RegisterModal } from "components/authentication";
import { getProfilePicUrl, signOutUser } from "utils/auth";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { AvatarDropdown } from "components/avatar";
import { spawnNotification } from "utils/notifications";
import { AuthContext } from "contexts/auth-context";

interface Props {}

const TopNav: React.FC<Props> = () => {
    const router = useRouter();
    const isDarkMode = useDarkMode();

    // Auth state.
    const [signedIn, setSignedIn] = useState(false);
    const { authState, authDispatch } = useContext(AuthContext);

    // Register modal state.
    const [registerIsOpen, setRegisterIsOpen] = useState<boolean>(false);
    const openRegisterModal = useCallback(
        () => setRegisterIsOpen(true),
        [setRegisterIsOpen],
    );
    const closeRegisterModal = useCallback(
        () => setRegisterIsOpen(false),
        [setRegisterIsOpen],
    );

    // Login modal state.
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
                if (!user.displayName) throw new Error("No display name");
                if (!user.email)
                    throw new Error("No email associated with account.");

                authDispatch({
                    type: "GLOBAL_LOGIN",
                    payload: {
                        username: user.displayName,
                        email: user.email,
                        profilePicUrl: getProfilePicUrl(),
                    },
                });
            }
        });
    }, [setSignedIn, authDispatch]);

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
                    {!signedIn && authState.authType !== "local" ? (
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
                        <AvatarDropdown
                            profilePicUrl={authState?.profilePicUrl || ""}
                            signOut={() => {
                                signOutUser()
                                    .then(() => {
                                        setSignedIn(false);
                                        setRegisterIsOpen(false);
                                        setLoginIsOpen(false);
                                        authDispatch({
                                            type: "GLOBAL_SIGN_OUT",
                                        });
                                        spawnNotification(
                                            "success",
                                            "You've signed out.",
                                        );
                                    })
                                    .catch((err) => {
                                        spawnNotification("error", err);
                                    });
                            }}
                        />
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopNav;
