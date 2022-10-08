import { useEffect } from "react";
import { spawnNotification } from "utils/notifications";

// For some reason, opening the modal shifts the main content container up
// by the height of the top nav. It also causes overflow on the main
// content. This is a workaround to forcefully undo that undesired
// behaviour.
export const useModalLayoutShiftFix = (isOpen: boolean) => {
    useEffect(() => {
        const container = document.getElementById("content-container");
        const htmlRoot = document.querySelector("html");
        if (!container) throw new Error("Main content container not found.");
        if (!htmlRoot) throw new Error("HTML root element not found.");
        const modalElem = document.getElementById(
            "div[data-reach-dialog-overlay]",
        );
        const alertElem = document.getElementById(
            "div[data-reach-alert-dialog-overlay]",
        );

        if (modalElem || alertElem) {
            container.style.marginTop = "56px";
            htmlRoot.style.overflow = "hidden";
        } else {
            container.style.marginTop = "0";
            htmlRoot.style.overflow = "auto";
        }
    }, [isOpen]);
};

// export const useModalLayoutShiftFix = (isOpen: boolean) => {
//     useEffect(() => {
//         const container = document.getElementById("content-container");
//         const htmlRoot = document.querySelector("html");
//         if (!container) throw new Error("Main content container not found.");
//         if (!htmlRoot) throw new Error("HTML root element not found.");

//         if (isOpen) {
//             container.style.marginTop = "56px";
//             htmlRoot.style.overflow = "hidden";
//         } else {
//             container.style.marginTop = "0";
//             htmlRoot.style.overflow = "auto";
//         }

//         return () => {
//             container.style.marginTop = "0";
//             htmlRoot.style.overflow = "auto";
//         };
//     }, [isOpen]);
// };
