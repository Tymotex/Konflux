import { useDarkMode } from "contexts/ThemeProvider";
import React from "react";
import styles from "./TextDivider.module.scss";

interface Props {
    text: string;
}

const TextDivider: React.FC<Props> = ({ text }) => {
    const isDarkMode = useDarkMode();

    return (
        <div className={`${styles.divider} ${isDarkMode ? styles.dark : ""}`}>
            {text}
        </div>
    );
};

export default TextDivider;
