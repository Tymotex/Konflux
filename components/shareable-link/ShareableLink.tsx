import React from "react";
import styles from "./ShareableLink.module.scss";
import ClipboardIcon from "./clipboard.svg";
import { useDarkMode } from "contexts/ThemeProvider";

interface Props {
    link: string;
}

const ShareableLink: React.FC<Props> = ({ link }) => {
    const isDarkMode = useDarkMode();

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
            <div className={styles.copyBtn}>
                <ClipboardIcon className={styles.icon} />
            </div>
        </div>
    );
};

export default ShareableLink;
