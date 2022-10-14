import { LoginModal, RegisterModal } from "components/form";
import React, { useCallback, useState } from "react";
import { ModalControlContext, ModalType } from "./modal-control-context";

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
                    setRegisterModalOpen(false);
                    break;
                case "register":
                    setRegisterModalOpen(open);
                    setLoginModalOpen(false);
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
