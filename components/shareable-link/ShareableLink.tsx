import React, { useCallback } from "react";
import styles from "./ShareableLink.module.scss";
import ClipboardIcon from "./clipboard.svg";
import { useDarkMode } from "contexts/ThemeProvider";
import { spawnNotification } from "utils/notifications";

interface Props {
    link: string;
}

const ShareableLink: React.FC<Props> = ({ link }) => {
    const isDarkMode = useDarkMode();

    const copyToClipboard = useCallback(
        () =>
            window.navigator.clipboard
                .writeText(link)
                .then(() => {
                    spawnNotification("success", "Copied to clipboard");
                })
                .catch((err) => {
                    spawnNotification(
                        "error",
                        `Couldn't copy to clipboard. Reason: ${err}`,
                    );
                }),
        [link],
    );

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
