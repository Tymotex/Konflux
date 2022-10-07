import { Dialog } from "@reach/dialog";
import React, { useEffect } from "react";

interface Props {
    isOpen: boolean;
    onDismiss: () => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onDismiss }) => {
    // For some reason, opening the modal shifts the main content container up
    // by the height of the top nav. It also causes overflow on the main
    // content. This is a workaround to forcefully undo that undesired
    // behaviour.
    useEffect(() => {
        const container = document.getElementById("content-container");
        const htmlRoot = document.querySelector("html");
        if (!container) throw new Error("Main content container not found.");
        if (!htmlRoot) throw new Error("HTML root element not found.");

        if (isOpen) {
            container.style.marginTop = "56px";
            htmlRoot.style.overflow = "hidden";
        } else {
            container.style.marginTop = "0";
            htmlRoot.style.overflow = "auto";
        }
    }, [isOpen]);

    return (
        <Dialog isOpen={isOpen} onDismiss={onDismiss}>
            Sign in with Google.
        </Dialog>
    );
};

export default LoginModal;
