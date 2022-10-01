import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export interface ThemeContextProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
    isDarkMode: false,
    toggleDarkMode: () => console.error("Dark mode toggler callback not set."),
});

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

/**
 * @returns Whether dark mode is active for this user.
 */
export const useDarkMode = (): boolean => {
    const theme = useContext(ThemeContext);
    return theme.isDarkMode;
};
