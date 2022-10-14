import { Button } from "components/button";
import GoogleSignInButton from "components/button/GoogleSignInButton";
import { TextField } from "components/form";
import Modal from "components/modal/Modal";
import TextDivider from "components/modal/TextDivider";
import { ModalControlContext } from "contexts/ModalControlProvider";
import { useDarkMode } from "contexts/ThemeProvider";
import React, { useCallback, useContext, useRef } from "react";
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
    const { openModal, closeModal } = useContext(ModalControlContext);

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
                    <p className={styles.description}>
                        Not registered yet?{" "}
                        <a onClick={() => openModal("register")}>Sign up</a>{" "}
                        instead.
                    </p>
                    <TextField
                        id="login-email"
                        refHandle={emailInputRef}
                        label="Email"
                        placeholder="E.g. linus@torvalds.com"
                        required
                        hideRequiredIndicator
                    />
                    <TextField
                        id="login-password"
                        refHandle={passwordInputRef}
                        label="Password"
                        type="password"
                        required
                        hideRequiredIndicator
                    />
                    <Button className={styles.formButton} isSubmit>
                        Log in
                    </Button>
                </form>
                <TextDivider text="Or" />
                <form className={styles.authProviderForm}>
                    <GoogleSignInButton />
                </form>
            </div>
        </Modal>
    );
};

export default LoginModal;
