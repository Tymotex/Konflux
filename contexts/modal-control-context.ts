import React from "react";

export type ModalType = "login" | "register";

interface ModalControlContextInterface {
    openModal: (modal: ModalType) => void;
    closeModal: (modal: ModalType) => void;
}

export const ModalControlContext =
    React.createContext<ModalControlContextInterface>({
        openModal: (_) => {},
        closeModal: (_) => {},
    });
