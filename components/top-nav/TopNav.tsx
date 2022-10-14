import { LoginModal, RegisterModal } from "components/form";
import { AvatarDropdown } from "components/avatar";
import { Button } from "components/button";
import { DarkModeToggle } from "components/dark-mode-toggle";
import { LocalAuthContext } from "contexts/local-auth-context";
import { ModalControlContext } from "contexts/modal-control-context";
import { useDarkMode } from "hooks/theme";
import { useEventId, useGlobalOrLocalEventMember } from "hooks/event";
import Link from "next/link";
import { useRouter } from "next/router";
import LogoDark from "public/logo-dark.svg";
import LogoLight from "public/logo-light.svg";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { GlobalAuth } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";
import styles from "./TopNav.module.scss";
import { EventContext } from "contexts/event-context";
import ImportantActionModal from "components/modal/ImportantActionModal";

interface Props {}

const TopNav: React.FC<Props> = () => {
    const router = useRouter();
    const isDarkMode = useDarkMode();
    const { openModal, closeModal } = useContext(ModalControlContext);
    const { eventState, eventDispatch } = useContext(EventContext);
    const eventId = useEventId();

    // Auth state.
    const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);
    const user = useGlobalOrLocalEventMember(localAuthState);

    /**
     * Signs the local user out.
     */
    const localSignOut = useCallback(() => {
        localAuthDispatch({ type: "LOCAL_SIGN_OUT" });
    }, [localAuthDispatch]);

    /**
     * Signs the global user out and closes all auth modals.
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

    /**
     * Leaves the current event. Must be either locally or globally
     * authenticated.
     * @param forceDeletion deletes user from event without confirmation.
     */
    const [showDeletionDialog, setShowDeletionDialog] = useState(false);
    const leaveEvent = useCallback(
        (forceDeletion: boolean = false) => {
            if (!user) {
                spawnNotification(
                    "error",
                    "Can't leave event when not authenticated.",
                );
                return;
            }
            if (!eventId) {
                spawnNotification("error", "Event ID not defined.");
                return;
            }
            if (!eventState) {
                spawnNotification("error", "Event undefined.");
                return;
            }

            // If the current user is the last owner of the event, then warn the
            // user that this will cause the event to be deleted.
            // Note: there is currently only 1 owner per event.
            if (eventState.members[user.username].isOwner && !forceDeletion) {
                // TODO: Open alert dialog.
                setShowDeletionDialog(true);
                return;
            }

            eventDispatch({
                type: "REMOVE_MEMBER",
                payload: { eventId, username: user?.username },
            });
        },
        [eventId, user, eventDispatch, eventState, setShowDeletionDialog],
    );

    return (
        <>
            <nav
                className={`${styles.topnav} ${isDarkMode ? styles.dark : ""}`}
            >
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
                            <>
                                {user.scope === "local" ? (
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
                                )}
                                <Button onClick={() => leaveEvent()}>
                                    Leave Event
                                </Button>
                            </>
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
            <ImportantActionModal
                show={showDeletionDialog}
                headingText="Event will be deleted"
                onBack={() => setShowDeletionDialog(false)}
            >
                <p>
                    Since you are the last owner of the event, this event will
                    be deleted when you leave.
                </p>
                <p>Are you sure you want to leave?</p>
                <Button>Go back</Button>
                <Button>Delete</Button>
            </ImportantActionModal>
        </>
    );
};

export default TopNav;
