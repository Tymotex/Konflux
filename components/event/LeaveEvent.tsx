import { Button } from "components/button";
import ImportantActionModal from "components/modal/ImportantActionModal";
import { EventContext } from "contexts/event-context";
import { LocalAuthContext } from "contexts/local-auth-context";
import {
    useAttemptLeaveEvent,
    useEventId,
    useGlobalOrLocalEventMember,
} from "hooks/event";
import React, { useCallback, useContext, useState } from "react";
import { spawnNotification } from "utils/notifications";
import LeaveIcon from "assets/icons/leave.svg";
import styles from "./LeaveEvent.module.scss";
import { useRouter } from "next/router";
import { MenuItem } from "@reach/menu-button";

interface Props {
    isMenuItem?: boolean;
    eventId: string | null | undefined;
}

const LeaveEvent: React.FC<Props> = ({ isMenuItem = false, eventId }) => {
    const { eventState, eventDispatch } = useContext(EventContext);
    const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);

    const eventMember = useGlobalOrLocalEventMember(localAuthState);

    const [showDeletionWarningDialog, setShowDeletionWarningDialog] =
        useState(false);
    const [showLeaveWarningDialog, setShowLeaveWarningDialog] = useState(false);

    const showModal = useCallback(
        (modal: "deletion-warning" | "leave-warning", state: boolean) => {
            switch (modal) {
                case "deletion-warning":
                    setShowDeletionWarningDialog(state);
                    setShowLeaveWarningDialog(false);
                    break;
                case "leave-warning":
                    setShowLeaveWarningDialog(state);
                    setShowDeletionWarningDialog(false);
                    break;
                default:
                    break;
            }
        },
        [setShowDeletionWarningDialog, setShowLeaveWarningDialog],
    );

    const leaveEvent = useAttemptLeaveEvent(
        eventMember,
        eventId,
        eventState,
        eventDispatch,
        showModal,
    );

    return (
        <>
            {!isMenuItem ? (
                <Button
                    colour="secondary"
                    Icon={LeaveIcon}
                    onClick={() => leaveEvent(false)}
                >
                    Leave Event
                </Button>
            ) : (
                <MenuItem onSelect={() => leaveEvent(false)}>
                    Leave Event
                </MenuItem>
            )}

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

export default LeaveEvent;
