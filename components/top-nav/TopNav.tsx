import { LoginModal, RegisterModal } from "components/authentication";
import { AvatarDropdown } from "components/avatar";
import { Button } from "components/button";
import { DarkModeToggle } from "components/dark-mode-toggle";
import { LocalAuthContext } from "contexts/local-auth-context";
import { useDarkMode } from "contexts/ThemeProvider";
import { useGlobalOrLocalEventMember } from "hooks/event";
import Link from "next/link";
import { useRouter } from "next/router";
import LogoDark from "public/logo-dark.svg";
import LogoLight from "public/logo-light.svg";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { GlobalAuth } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";
import styles from "./TopNav.module.scss";

interface Props {}

const TopNav: React.FC<Props> = () => {
    const router = useRouter();
    const isDarkMode = useDarkMode();

    // Auth state.
    const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);
    const user = useGlobalOrLocalEventMember(localAuthState);

    const localSignOut = useCallback(() => {
        localAuthDispatch({ type: "LOCAL_SIGN_OUT" });
    }, [localAuthDispatch]);

    // Register modal state.
    const [registerIsOpen, setRegisterIsOpen] = useState<boolean>(false);
    const openRegisterModal = useCallback(
        () => setRegisterIsOpen(true),
        [setRegisterIsOpen],
    );
    const closeRegisterModal = useCallback(() => {
        setRegisterIsOpen(false);
        router.reload();
    }, [setRegisterIsOpen]);

    // Login modal state.
    const [loginIsOpen, setLoginIsOpen] = useState<boolean>(false);
    const openLoginModal = useCallback(
        () => setLoginIsOpen(true),
        [setLoginIsOpen],
    );
    const closeLoginModal = useCallback(() => {
        setLoginIsOpen(false);
    }, [setLoginIsOpen, router]);

    // If at the homepage and either the login or register query parameter
    // was supplied, open the corresponding modal.
    useEffect(() => {
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

    /**
     * Signs the user out and closes all auth modals.
     */
    const handleSignOut = useCallback(() => {
        GlobalAuth.signOut()
            .then(() => {
                setRegisterIsOpen(false);
                setLoginIsOpen(false);
                spawnNotification("success", "You've signed out.");
            })
            .catch((err) => {
                spawnNotification("error", err);
            });
    }, [GlobalAuth, setRegisterIsOpen, setLoginIsOpen]);

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
                    {user ? (
                        user.scope === "local" ? (
                            <>
                                <Button onClick={localSignOut}>
                                    Sign Out ({user.username})
                                </Button>
                            </>
                        ) : user.scope === "global" ? (
                            <AvatarDropdown
                                profilePicUrl={user.profilePicUrl || ""}
                                signOut={handleSignOut}
                            />
                        ) : (
                            <></>
                        )
                    ) : (
                        // When user isn't signed in, render login and register
                        // buttons.
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
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopNav;
