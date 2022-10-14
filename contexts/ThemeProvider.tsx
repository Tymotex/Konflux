import { useCallback, useEffect, useState } from "react";
import { ThemeContext } from "./theme-context";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(localStorage.getItem("isDarkMode") === "true");
    }, []);

    const toggleDarkMode = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("isDarkMode", (!isDarkMode).toString());
            setIsDarkMode(!isDarkMode);
        }
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleDarkMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
