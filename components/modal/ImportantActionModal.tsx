import React, { useContext, useRef } from "react";
import {
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogLabel,
    AlertDialogOverlay,
} from "@reach/alert-dialog";
import { Button } from "components/button";
import { Callout } from "components/callout";
import IdeaIcon from "components/callout/idea.svg";
import { TextField } from "components/form";
import { EventContext } from "contexts/event-context";
import { LocalAuthAction } from "contexts/local-auth-context";
import { ModalControlContext } from "contexts/modal-control-context";
import { useDarkMode } from "hooks/theme";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import BackIcon from "./back.svg";
import styles from "./ImportantActionModal.module.scss";

interface Props {
    show: boolean;
    children: React.ReactNode;
    headingText: string;
    onBack: () => void;
    backText?: string;
}

const MotionOverlay = motion(AlertDialogOverlay);

const ImportantActionModal: React.FC<Props> = ({
    show,
    children,
    headingText,
    backText,
    onBack,
}) => {
    const backBtnRef = useRef<HTMLButtonElement>(null);
    const isDarkMode = useDarkMode();
    const router = useRouter();

    return (
        <AnimatePresence mode="wait">
            {show && (
                <MotionOverlay
                    leastDestructiveRef={backBtnRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <AlertDialogContent
                        className={`${styles.container} ${
                            isDarkMode ? styles.dark : ""
                        }`}
                    >
                        <div className={styles.content}>
                            <button
                                ref={backBtnRef}
                                className={styles.backBtn}
                                onClick={onBack}
                            >
                                <BackIcon className={styles.icon} />
                                {backText}
                            </button>

                            <AlertDialogLabel className={styles.headingText}>
                                {headingText}
                            </AlertDialogLabel>
                            {children}
                        </div>
                    </AlertDialogContent>
                </MotionOverlay>
            )}
        </AnimatePresence>
    );
};

export default ImportantActionModal;
