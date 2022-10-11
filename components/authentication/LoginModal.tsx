import { DialogContent, DialogOverlay } from "@reach/dialog";
import { Logo } from "components/brand";
import { Button } from "components/button";
import GoogleSignInButton from "components/button/GoogleSignInButton";
import { TextField } from "components/form";
import { useDarkMode } from "contexts/ThemeProvider";
import React, { useCallback, useRef } from "react";
import { GlobalAuth } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";
import CloseIcon from "./close.svg";
import styles from "./Modal.module.scss";

interface Props {
    isOpen: boolean;
    onDismiss: () => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onDismiss }) => {
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const isDarkMode = useDarkMode();

    const logInUser: React.FormEventHandler<HTMLFormElement> = useCallback(
        (e) => {
            e.preventDefault();
            if (!emailInputRef.current)
                throw new Error("Email input detached.");
            if (!passwordInputRef.current)
                throw new Error("Password input detached.");

            const password = passwordInputRef.current.value;
            const email = emailInputRef.current.value;

            GlobalAuth.signIn({ provider: "native", email, password })
                .then(() => {
                    onDismiss();
                })
                .catch((err) => {
                    spawnNotification("error", err.message);
                    if (passwordInputRef.current)
                        passwordInputRef.current.value = "";
                });
        },
        [passwordInputRef, emailInputRef, onDismiss],
    );

    return (
        <DialogOverlay
            isOpen={isOpen}
            onDismiss={onDismiss}
            className={styles.overlay}
            // TODO: move this to class? I recall this didn't work before though.
            style={{
                background: "hsl(0, 100%, 0%, 0.5)",
                backdropFilter: "blur(2px)",
                zIndex: 10000,
            }}
        >
            <DialogContent
                aria-label="Login form"
                className={`${styles.modalContainer} ${
                    isDarkMode ? styles.dark : ""
                }`}
            >
                <div className={styles.content}>
                    <header className={styles.header}>
                        <button
                            className={styles.closeButton}
                            onClick={onDismiss}
                        >
                            <CloseIcon />
                        </button>
                        <div className={styles.headingCurvedDivider}>
                            <svg
                                data-name="Layer 1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 1200 120"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                                    className={styles.fill}
                                />
                            </svg>
                        </div>

                        <Logo size={32} className={styles.logo} />
                        <h2 className={styles.headingText}>Welcome back.</h2>
                    </header>

                    <form className={styles.form} onSubmit={logInUser}>
                        <TextField
                            id="login-email"
                            refHandle={emailInputRef}
                            label="Email"
                            placeholder="E.g. linus@torvalds.com"
                            required
                        />
                        <TextField
                            id="login-password"
                            refHandle={passwordInputRef}
                            label="Password"
                            type="password"
                            required
                        />
                        <Button className={styles.formButton} isSubmit>
                            Log in
                        </Button>
                    </form>
                    <p className={styles.authProviderDivider}>
                        Or continue with
                    </p>
                    <form className={styles.authProviderForm}>
                        <GoogleSignInButton />
                    </form>
                </div>
            </DialogContent>
        </DialogOverlay>
    );
};

export default LoginModal;
