import { useDarkMode } from "hooks/theme";
import React, { useState } from "react";
import styles from "./IconButton.module.scss";
import Tooltip from "react-tooltip";

interface Props {
    Icon: React.ElementType;
    onClick: () => void;
}

const IconButton: React.FC<Props> = ({ Icon, onClick }) => {
    const isDarkMode = useDarkMode();

    return (
        <>
            <button
                className={`${styles.btn} ${isDarkMode ? styles.dark : ""}`}
                onClick={onClick}
            >
                <Icon className={styles.icon} />
            </button>
        </>
    );
};

export default IconButton;
