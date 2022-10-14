import React, { useCallback } from "react";
import styles from "./GoogleSignInButton.module.scss";
import GoogleIcon from "assets/icons/google.svg";
import { useDarkMode } from "hooks/theme";
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
            <GoogleIcon className={styles.googleIcon} />
            <div className={styles.text}>Sign in with Google</div>
        </button>
    );
};

export default GoogleSignInButton;
