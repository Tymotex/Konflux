import { LoginModal, RegisterModal } from "components/form";
import { AvatarDropdown } from "components/avatar";
import { Button } from "components/button";
import { DarkModeToggle } from "components/dark-mode-toggle";
import { LocalAuthContext } from "contexts/local-auth-context";
import { ModalControlContext } from "contexts/ModalControlProvider";
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
    const { openModal, closeModal } = useContext(ModalControlContext);

    // Auth state.
    const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);
    const user = useGlobalOrLocalEventMember(localAuthState);

    const localSignOut = useCallback(() => {
        localAuthDispatch({ type: "LOCAL_SIGN_OUT" });
    }, [localAuthDispatch]);

    /**
     * Signs the user out and closes all auth modals.
     */
    const handleSignOut = useCallback(() => {
        GlobalAuth.signOut()
            .then(() => {
                closeModal("register");
                closeModal("login");
                spawnNotification("success", "You've signed out.");
            })
            .catch((err) => {
                spawnNotification("error", err);
            });
    }, [closeModal]);

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
                            <button
                                className={styles.login}
                                onClick={() => openModal("login")}
                            >
                                Login
                            </button>
                            <button
                                className={styles.register}
                                onClick={() => openModal("register")}
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
