import React, { useEffect, useState } from "react";
import SuccessIcon from "./success.svg";
import FailureIcon from "./failure.svg";
import PendingIcon from "./pending.svg";
import styles from "./SyncStatus.module.scss";

export type Status = "success" | "failure" | "pending" | null;

interface Props {
    status: Status;
}

let lastTimeout: any = null;

const SyncStatus: React.FC<Props> = ({ status }) => {
    return (
        <>
            {status === "success" ? (
                <div className={`${styles.success} ${styles.statusContainer}`}>
                    <SuccessIcon className={styles.icon} />
                    {/* <span
                        className={styles.statusMessage}
                        aria-label="sync-status"
                    >
                        Saved
                    </span> */}
                </div>
            ) : status === "failure" ? (
                <div className={`${styles.failure} ${styles.statusContainer}`}>
                    <FailureIcon className={styles.icon} />
                    <span
                        className={styles.statusMessage}
                        aria-label="sync-status"
                    >
                        Failed
                    </span>
                </div>
            ) : status === "pending" ? (
                <div className={`${styles.pending} ${styles.statusContainer}`}>
                    <PendingIcon className={styles.icon} />
                    <span
                        className={styles.statusMessage}
                        aria-label="sync-status"
                    >
                        Syncing
                    </span>
                </div>
            ) : (
                ""
            )}
        </>
    );
};

export default SyncStatus;
