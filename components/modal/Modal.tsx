import { DialogContent, DialogOverlay } from "@reach/dialog";
import { Logo } from "components/brand";
import { useDarkMode } from "hooks/theme";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import CloseIcon from "assets/icons/close.svg";
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
