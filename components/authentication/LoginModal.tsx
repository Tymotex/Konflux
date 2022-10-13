import { Button } from "components/button";
import GoogleSignInButton from "components/button/GoogleSignInButton";
import { TextField } from "components/form";
import Modal from "components/modal/Modal";
import { useDarkMode } from "contexts/ThemeProvider";
import React, { useCallback, useRef } from "react";
import { GlobalAuth } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";
import styles from "./Auth.module.scss";

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
        <Modal
            isOpen={isOpen}
            onDismiss={onDismiss}
            contentAriaLabel={"Login form"}
            headerText="Welcome back."
        >
            <div className={styles.content}>
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
                <p className={styles.authProviderDivider}>Or continue with</p>
                <form className={styles.authProviderForm}>
                    <GoogleSignInButton />
                </form>
            </div>
        </Modal>
    );
};

export default LoginModal;
