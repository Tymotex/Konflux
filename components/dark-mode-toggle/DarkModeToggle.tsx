import React, { useContext, useMemo } from "react";
import SunIcon from "./sun.svg";
import MoonIcon from "./moon.svg";
import styles from "./DarkModeToggle.module.scss";
import { ThemeContext } from "contexts/ThemeProvider";

interface Props {}

const DarkModeToggle: React.FC<Props> = () => {
    const theme = useContext(ThemeContext);

    return (
        <button
            className={styles.btn}
            onClick={() => theme.toggleDarkMode()}
            aria-label="Dark mode toggler"
        >
            {theme.isDarkMode ? (
                <MoonIcon
                    className={`${styles.icon} ${
                        theme.isDarkMode ? styles.dark : ""
                    }`}
                />
            ) : (
                <SunIcon
                    className={`${styles.icon} ${
                        theme.isDarkMode ? styles.dark : ""
                    }`}
                />
            )}
        </button>
    );
};

export default DarkModeToggle;
