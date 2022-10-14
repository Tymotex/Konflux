import { Button } from "components/button";
import GoogleSignInButton from "components/button/GoogleSignInButton";
import { TextField } from "components/form";
import Modal from "components/modal/Modal";
import TextDivider from "components/modal/TextDivider";
import { ModalControlContext } from "contexts/ModalControlProvider";
import React, { useCallback, useContext, useRef } from "react";
import { GlobalAuth } from "utils/global-auth";
import { spawnNotification } from "utils/notifications";
import styles from "./Auth.module.scss";

interface Props {
    isOpen: boolean;
    onDismiss: () => void;
}

const RegisterModal: React.FC<Props> = ({ isOpen, onDismiss }) => {
    const nameInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const { openModal } = useContext(ModalControlContext);

    const registerUser: React.FormEventHandler<HTMLFormElement> = useCallback(
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

            GlobalAuth.signUp({ provider: "native", email, username, password })
                .then(() => {
                    onDismiss();
                })
                .catch((err) => {
                    spawnNotification("error", err.message);
                    if (passwordInputRef.current)
                        passwordInputRef.current.value = "";
                });
        },
        [nameInputRef, emailInputRef, passwordInputRef, onDismiss],
    );

    return (
        <Modal
            isOpen={isOpen}
            onDismiss={onDismiss}
            contentAriaLabel="Registration form"
            headerText="Create an account."
        >
            <div className={styles.content}>
                <form className={styles.form} onSubmit={registerUser}>
                    <p className={styles.description}>
                        Sign up to skip registering for events and see your
                        events from all your devices.
                    </p>
                    <p className={styles.description}>
                        Already registered?{" "}
                        <a onClick={() => openModal("login")}>Sign in</a>{" "}
                        instead.
                    </p>
                    <TextField
                        id="login-name"
                        refHandle={nameInputRef}
                        label="Your name"
                        placeholder="E.g. Linus Torvalds"
                        required
                        hideRequiredIndicator
                    />
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
                        Create
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

export default RegisterModal;
