import { useDarkMode } from "hooks/theme";
import React from "react";
import styles from "./Callout.module.scss";

interface Props {
    children: React.ReactNode;
    Icon: React.ElementType;
}

const Callout: React.FC<Props> = ({ Icon, children }) => {
    const isDarkMode = useDarkMode();

    return (
        <div
            className={`${styles.callout} ${isDarkMode ? styles.dark : ""}`}
            aria-label="Date selection info message"
        >
            <Icon className={styles.icon} aria-label="info symbol" />
            <div aria-label="Message contents">{children}</div>
        </div>
    );
};

export default Callout;
