import { LoginModal, RegisterModal } from "components/authentication";
import React, { useCallback, useState } from "react";

type ModalType = "login" | "register";

interface ModalControlContextInterface {
    openModal: (modal: ModalType) => void;
    closeModal: (modal: ModalType) => void;
}

export const ModalControlContext =
    React.createContext<ModalControlContextInterface>({
        openModal: (_) => {},
        closeModal: (_) => {},
    });

interface ModalControlProviderProps {
    children: React.ReactNode;
}

export const ModalControlProvider: React.FC<ModalControlProviderProps> = ({
    children,
}) => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);

    const setModal = useCallback(
        (modal: ModalType, open: boolean) => {
            switch (modal) {
                case "login":
                    setLoginModalOpen(open);
                    break;
                case "register":
                    setRegisterModalOpen(open);
                    break;
                default:
                    throw new Error("Unknown modal type.");
            }
        },
        [setLoginModalOpen, setRegisterModalOpen],
    );

    return (
        <ModalControlContext.Provider
            value={{
                openModal: (modal) => setModal(modal, true),
                closeModal: (modal) => setModal(modal, false),
            }}
        >
            <LoginModal
                isOpen={loginModalOpen}
                onDismiss={() => setModal("login", false)}
            />
            <RegisterModal
                isOpen={registerModalOpen}
                onDismiss={() => setModal("register", false)}
            />
            {children}
        </ModalControlContext.Provider>
    );
};
