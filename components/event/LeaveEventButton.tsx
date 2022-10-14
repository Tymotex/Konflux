import { Button } from "components/button";
import ImportantActionModal from "components/modal/ImportantActionModal";
import { EventContext } from "contexts/event-context";
import { LocalAuthContext } from "contexts/local-auth-context";
import { useEventId, useGlobalOrLocalEventMember } from "hooks/event";
import React, { useCallback, useContext, useState } from "react";
import { spawnNotification } from "utils/notifications";
import LeaveIcon from "assets/icons/leave.svg";
import styles from "./LeaveEvent.module.scss";
import { useRouter } from "next/router";

interface Props {}

const LeaveEventButton: React.FC<Props> = () => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);
    const router = useRouter();

    const eventMember = useGlobalOrLocalEventMember(localAuthState);
    const eventId = useEventId();

    const [showDeletionWarningDialog, setShowDeletionWarningDialog] =
        useState(false);
    const [showLeaveWarningDialog, setShowLeaveWarningDialog] = useState(false);

    /**
     * Leaves the current event. Must be either locally or globally
     * authenticated.
     * @param forceDeletion deletes user from event without confirmation.
     */
    const leaveEvent = useCallback(
        (confirmedDeletion: boolean = false) => {
            if (!eventMember) {
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
            if (
                eventState.members[eventMember.username].isOwner &&
                !confirmedDeletion
            ) {
                setShowDeletionWarningDialog(true);
                return;
            }

            // Provide a leaving warning.
            if (!confirmedDeletion) {
                setShowLeaveWarningDialog(true);
                return;
            }

            eventDispatch({
                type: "REMOVE_MEMBER",
                payload: { eventId, username: eventMember?.username },
            });

            router.push("/");
        },
        [
            eventId,
            eventMember,
            eventState,
            eventDispatch,
            setShowDeletionWarningDialog,
            setShowLeaveWarningDialog,
            router,
        ],
    );

    return (
        <>
            <Button
                colour="secondary"
                Icon={LeaveIcon}
                onClick={() => leaveEvent(false)}
            >
                Leave Event
            </Button>

            <ImportantActionModal
                show={showDeletionWarningDialog}
                headingText="Event will be deleted."
                onBack={() => setShowDeletionWarningDialog(false)}
                className={styles.leaveEventModal}
            >
                <p>
                    Since you are the last owner of the event, this event will
                    be deleted when you leave.
                </p>
                <p>Are you sure you want to leave?</p>
                <div className={styles.buttonGroup}>
                    <Button
                        onClick={() => setShowDeletionWarningDialog(false)}
                        colour="secondary"
                    >
                        Go back
                    </Button>
                    <Button onClick={() => leaveEvent(true)}>Delete</Button>
                </div>
            </ImportantActionModal>

            <ImportantActionModal
                show={showLeaveWarningDialog}
                headingText="Leaving event."
                onBack={() => setShowLeaveWarningDialog(false)}
                className={styles.leaveEventModal}
            >
                <p>
                    Are you sure you want to leave? You may rejoin again later.
                </p>
                <div className={styles.buttonGroup}>
                    <Button
                        onClick={() => setShowLeaveWarningDialog(false)}
                        colour="secondary"
                    >
                        Go back
                    </Button>
                    <Button onClick={() => leaveEvent(true)}>Delete</Button>
                </div>
            </ImportantActionModal>
        </>
    );
};

export default LeaveEventButton;
