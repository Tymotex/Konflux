import { createContext, useContext } from "react";

interface ThemeContextProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
    isDarkMode: false,
    toggleDarkMode: () => console.error("Dark mode toggler callback not set."),
});
