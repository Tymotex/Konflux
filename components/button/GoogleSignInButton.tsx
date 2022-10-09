import React from "react";
import styles from "./GoogleSignInButton.module.scss";
import GoogleIcon from "./google.svg";
import { useDarkMode } from "contexts/ThemeProvider";
import { authProviderSignIn } from "utils/auth";

interface Props {}

const GoogleSignInButton: React.FC<Props> = () => {
    const isDarkMode = useDarkMode();

    return (
        <button
            className={`${styles.button} ${isDarkMode ? styles.dark : ""}`}
            onClick={(e) => {
                e.preventDefault();
                authProviderSignIn();
            }}
        >
            <GoogleIcon className={styles.googleIcon} /> Sign in with Google
        </button>
    );
};

export default GoogleSignInButton;
