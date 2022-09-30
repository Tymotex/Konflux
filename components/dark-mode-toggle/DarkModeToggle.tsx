import React, { useMemo } from "react";
import SunIcon from "./sun.svg";
import MoonIcon from "./moon.svg";
import styles from "./DarkModeToggle.module.scss";

interface Props {}

const DarkModeToggle: React.FC<Props> = () => {
    const isDarkMode = useMemo(() => true, []);

    return isDarkMode ? (
        <MoonIcon className={styles.icon} />
    ) : (
        <SunIcon className={styles.icon} />
    );
};

export default DarkModeToggle;
