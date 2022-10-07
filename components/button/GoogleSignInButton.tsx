import React from "react";
import styles from "./GoogleSignInButton.module.scss";
import GoogleIcon from "./google.svg";
import { useDarkMode } from "contexts/ThemeProvider";

interface Props {}

const GoogleSignInButton: React.FC<Props> = () => {
    const isDarkMode = useDarkMode();

    return (
        <button className={`${styles.button} ${isDarkMode ? styles.dark : ""}`}>
            <GoogleIcon className={styles.googleIcon} /> Sign in with Google
        </button>
    );
};

export default GoogleSignInButton;
