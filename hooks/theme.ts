import { ThemeContext } from "contexts/theme-context";
import { useContext } from "react";

/**
 * @returns Whether dark mode is active for this user.
 */
export const useDarkMode = (): boolean => {
    const theme = useContext(ThemeContext);
    return theme.isDarkMode;
};
