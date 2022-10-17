import ClipboardIcon from "assets/icons/clipboard.svg";
import { useCopyTextToClipboard } from "hooks/clipboard";
import { useDarkMode } from "hooks/theme";
import React, { useCallback } from "react";
import { spawnNotification } from "utils/notifications";
import styles from "./ShareableLink.module.scss";

interface Props {
    link: string;
}

const ShareableLink: React.FC<Props> = ({ link }) => {
    const isDarkMode = useDarkMode();
    const copyToClipboard = useCopyTextToClipboard(link);

    return (
        <div
            className={`${styles.linkContainer} ${
                isDarkMode ? styles.dark : ""
            }`}
        >
            <input
                className={styles.linkField}
                type="text"
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
                value={link}
            ></input>
            <div className={styles.copyBtn} onClick={copyToClipboard}>
                <ClipboardIcon className={styles.icon} />
            </div>
        </div>
    );
};

export default ShareableLink;
