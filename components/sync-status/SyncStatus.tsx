import React, { useCallback, useEffect, useMemo, useState } from "react";
import SuccessIcon from "./success.svg";
import FailureIcon from "./failure.svg";
import PendingIcon from "./pending.svg";
import styles from "./SyncStatus.module.scss";
import { debounce } from "utils/debounce";
import { motion, AnimatePresence } from "framer-motion";

export type Status = "success" | "failure" | "pending" | null;

interface Props {
    status: Status;
}

const animVariants = {
    hidden: { opacity: 0, transition: { duration: 0.1 } },
    visible: { opacity: 1, transition: { duration: 0.1 } },
};

const SyncStatus: React.FC<Props> = ({ status }) => {
    return (
        <div className={styles.container}>
            <AnimatePresence mode="wait">
                {status === "success" && (
                    <motion.div
                        exit="hidden"
                        initial="hidden"
                        animate="visible"
                        variants={animVariants}
                        className={`${styles.success} ${styles.statusContainer}`}
                    >
                        <SuccessIcon className={styles.icon} />
                        <span
                            className={styles.statusMessage}
                            aria-label="sync-status"
                        >
                            Saved
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {status === "failure" && (
                    <motion.div
                        exit="hidden"
                        initial="hidden"
                        animate="visible"
                        variants={animVariants}
                        className={`${styles.failure} ${styles.statusContainer}`}
                    >
                        <FailureIcon className={styles.icon} />
                        <span
                            className={styles.statusMessage}
                            aria-label="sync-status"
                        >
                            Failed
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {status === "pending" && (
                    <motion.div
                        exit="hidden"
                        initial="hidden"
                        animate="visible"
                        variants={animVariants}
                        className={`${styles.pending} ${styles.statusContainer}`}
                    >
                        <PendingIcon className={styles.icon} />
                        <span
                            className={styles.statusMessage}
                            aria-label="sync-status"
                        >
                            Syncing
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            {status === null && <div style={{ visibility: "hidden" }} />}
        </div>
    );
};

export default SyncStatus;
