import { DialogContent, DialogOverlay } from "@reach/dialog";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import styles from "./Modal.module.scss";
import CloseIcon from "./close.svg";
import { useDarkMode } from "contexts/ThemeProvider";
import { Logo } from "components/brand";
import { TextField } from "components/form";
import { Button } from "components/button";
import GoogleSignInButton from "components/button/GoogleSignInButton";
import { useModalLayoutShiftFix } from "hooks/modal";
import { getProfilePicUrl, nativeSignUp } from "utils/auth";
import { spawnNotification } from "utils/notifications";
import { AuthContext } from "contexts/auth-context";

interface Props {
    isOpen: boolean;
    onDismiss: () => void;
}

const RegisterModal: React.FC<Props> = ({ isOpen, onDismiss }) => {
    const nameInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const isDarkMode = useDarkMode();

    const { authState, authDispatch } = useContext(AuthContext);

    useModalLayoutShiftFix(isOpen);

    const logInUser: React.FormEventHandler<HTMLFormElement> = useCallback(
        (e) => {
            e.preventDefault();
            if (
                !nameInputRef.current ||
                !emailInputRef.current ||
                !passwordInputRef.current
            ) {
                throw new Error("Login inputs detached.");
            }
            const username = nameInputRef.current.value;
            const email = emailInputRef.current.value;
            const password = passwordInputRef.current.value;

            nativeSignUp(username, email, password)
                .then(() => {
                    onDismiss();
                    authDispatch({
                        type: "GLOBAL_LOGIN",
                        payload: {
                            username,
                            email,
                            profilePicUrl: getProfilePicUrl(),
                        },
                    });
                })
                .catch((err) => {
                    spawnNotification("error", err.message);
                });
        },
        [nameInputRef, emailInputRef, passwordInputRef, onDismiss],
    );

    return (
        <DialogOverlay
            isOpen={isOpen}
            onDismiss={onDismiss}
            className={styles.overlay}
            style={{
                background: "hsl(0, 100%, 0%, 0.5)",
                backdropFilter: "blur(2px)",
                zIndex: 10000,
            }}
        >
            <DialogContent
                aria-label="Registration form"
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
                        <h2 className={styles.headingText}>
                            Create an account.
                        </h2>
                    </header>
                    <form className={styles.form} onSubmit={logInUser}>
                        <TextField
                            id="login-name"
                            refHandle={nameInputRef}
                            label="Your name"
                            placeholder="E.g. Linus Torvalds"
                            required
                        />
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
                            Create
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

export default RegisterModal;
