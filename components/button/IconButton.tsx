import { useDarkMode } from "hooks/theme";
import React from "react";
import styles from "./IconButton.module.scss";

interface Props {
    Icon: React.ElementType;
}

const IconButton: React.FC<Props> = ({ Icon }) => {
    const isDarkMode = useDarkMode();

    return (
        <button className={`${styles.btn} ${isDarkMode ? styles.dark : ""}`}>
            <Icon className={styles.icon} />
        </button>
    );
};

export default IconButton;
