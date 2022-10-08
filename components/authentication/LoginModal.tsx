import { DialogContent, DialogOverlay } from "@reach/dialog";
import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.scss";
import CloseIcon from "./close.svg";
import { useDarkMode } from "contexts/ThemeProvider";
import { Logo } from "components/brand";
import { TextField } from "components/form";
import { Button } from "components/button";
import GoogleSignInButton from "components/button/GoogleSignInButton";
import { useModalLayoutShiftFix } from "hooks/modal";

interface Props {
    isOpen: boolean;
    onDismiss: () => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onDismiss }) => {
    const nameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const isDarkMode = useDarkMode();

    useModalLayoutShiftFix(isOpen);

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
                        <h2 className={styles.headingText}>
                            Create an account.
                        </h2>
                    </header>
                    <form className={styles.form}>
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
                        <Button className={styles.formButton}>Create</Button>
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
