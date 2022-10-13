import { DialogContent, DialogOverlay } from "@reach/dialog";
import { Logo } from "components/brand";
import { useDarkMode } from "contexts/ThemeProvider";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import CloseIcon from "./close.svg";
import styles from "./Modal.module.scss";

interface Props {
    isOpen: boolean;
    onDismiss: () => void;
    contentAriaLabel: string;
    children: React.ReactNode;
    headerText?: string;
}

const MotionOverlay = motion(DialogOverlay, { forwardMotionProps: true });

const Modal: React.FC<Props> = ({
    isOpen,
    onDismiss,
    contentAriaLabel,
    children,
    headerText,
}) => {
    const isDarkMode = useDarkMode();

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <MotionOverlay
                    isOpen={isOpen}
                    onDismiss={onDismiss}
                    style={{
                        background: "hsl(0, 100%, 0%, 0.5)",
                        backdropFilter: "blur(2px)",
                        zIndex: 10000,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <DialogContent
                        aria-label={contentAriaLabel}
                        className={`${styles.modalContainer} ${
                            isDarkMode ? styles.dark : ""
                        }`}
                    >
                        <div className={styles.content}>
                            {headerText && (
                                <header className={styles.header}>
                                    <button
                                        className={styles.closeButton}
                                        onClick={onDismiss}
                                    >
                                        <CloseIcon />
                                    </button>
                                    <div
                                        className={styles.headingCurvedDivider}
                                    >
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
                                        {headerText}
                                    </h2>
                                </header>
                            )}
                            {children}
                        </div>
                    </DialogContent>
                </MotionOverlay>
            )}
        </AnimatePresence>
    );
};

export default Modal;
