import React, { useCallback } from "react";
import styles from "./GoogleSignInButton.module.scss";
import GoogleIcon from "./google.svg";
import { useDarkMode } from "contexts/ThemeProvider";
import { GlobalAuth } from "utils/global-auth";

interface Props {}

const GoogleSignInButton: React.FC<Props> = () => {
    const isDarkMode = useDarkMode();

    const googleSignIn: React.MouseEventHandler<HTMLButtonElement> =
        useCallback((e) => {
            e.preventDefault();
            GlobalAuth.signIn({ provider: "google" });
        }, []);

    return (
        <button
            className={`${styles.button} ${isDarkMode ? styles.dark : ""}`}
            onClick={googleSignIn}
        >
            <GoogleIcon className={styles.googleIcon} /> Sign in with Google
        </button>
    );
};

export default GoogleSignInButton;
