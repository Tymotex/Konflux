import { LoginModal, RegisterModal } from "components/form";
import { useGlobalOrLocalEventMember } from "hooks/event";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { LocalAuthContext } from "./local-auth-context";
import { ModalControlContext, ModalType } from "./modal-control-context";

interface ModalControlProviderProps {
    children: React.ReactNode;
}

export const ModalControlProvider: React.FC<ModalControlProviderProps> = ({
    children,
}) => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);

    const { localAuthState, localAuthDispatch } = useContext(LocalAuthContext);
    const isUserAuthenticated = useGlobalOrLocalEventMember(localAuthState);

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

    useEffect(() => {
        if (isUserAuthenticated) {
            setLoginModalOpen(false);
            setRegisterModalOpen(false);
        }
    }, [isUserAuthenticated]);

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
