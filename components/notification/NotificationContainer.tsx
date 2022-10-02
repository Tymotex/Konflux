import { useDarkMode } from "contexts/ThemeProvider";
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
            />
        </div>
    );
};

export default NotificationContainer;
