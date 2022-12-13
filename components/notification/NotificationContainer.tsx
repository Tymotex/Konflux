import { useDarkMode } from "hooks/theme";
import React from "react";
import { ToastContainer } from "react-toastify";

interface Props {}

const NotificationContainer: React.FC<Props> = () => {
    const isDarkMode = useDarkMode();

    return (
        <div>
            <ToastContainer
                theme={isDarkMode ? "dark" : "light"}
                position="top-center"
                hideProgressBar
                pauseOnFocusLoss={false}
                style={{ zIndex: 1000000 }}
                autoClose={7000}
            />
        </div>
    );
};

export default NotificationContainer;
