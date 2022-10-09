import { DialogContent, DialogOverlay } from "@reach/dialog";
import React, { useCallback, useEffect, useRef } from "react";
import styles from "./Modal.module.scss";
import CloseIcon from "./close.svg";
import { useDarkMode } from "contexts/ThemeProvider";
import { Logo } from "components/brand";
import { TextField } from "components/form";
import { Button } from "components/button";
import GoogleSignInButton from "components/button/GoogleSignInButton";
import { useModalLayoutShiftFix } from "hooks/modal";
import { nativeSignIn } from "utils/auth";
import { spawnNotification } from "utils/notifications";

interface Props {
    isOpen: boolean;
    onDismiss: () => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onDismiss }) => {
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const isDarkMode = useDarkMode();

    useModalLayoutShiftFix(isOpen);

    const logInUser: React.FormEventHandler<HTMLFormElement> = useCallback(
        (e) => {
            e.preventDefault();
            if (!emailInputRef.current)
                throw new Error("Email input detached.");
            if (!passwordInputRef.current)
                throw new Error("Password input detached.");

            const password = passwordInputRef.current.value;
            const email = emailInputRef.current.value;

            nativeSignIn(email, password)
                .then(() => {
                    onDismiss();
                })
                .catch((err) => {
                    spawnNotification("error", err.message);
                    if (passwordInputRef.current)
                        passwordInputRef.current.value = "";
                });
        },
        [passwordInputRef, emailInputRef],
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
                className={`${styles.modalContainer} ${
                    isDarkMode ? styles.dark : ""
                }`}
            >
                <div className={styles.content}>
                    <button className={styles.closeButton} onClick={onDismiss}>
                        <CloseIcon />
                    </button>
                    <header>
                        <Logo size={32} />
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
