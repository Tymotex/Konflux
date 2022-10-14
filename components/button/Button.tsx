import { useDarkMode } from "hooks/theme";
import React from "react";
import styles from "./Button.module.scss";

interface Props {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    style?: React.CSSProperties;
    className?: string;
    isSubmit?: boolean;
    colour?: "primary" | "secondary";
    Icon?: React.ElementType;
}

const Button: React.FC<Props> = ({
    children,
    onClick,
    style,
    className,
    isSubmit = false,
    colour = "primary",
    Icon,
}) => {
    const isDarkMode = useDarkMode();

    return (
        <button
            className={`${styles.btn} ${
                colour === "primary"
                    ? styles.primary
                    : colour === "secondary"
                    ? styles.secondary
                    : ""
            } ${className ? className : ""} ${isDarkMode ? styles.dark : ""}`}
            onClick={onClick}
            style={style}
            type={isSubmit ? "submit" : "button"}
        >
            {Icon && <Icon className={styles.icon} />}
            {children}
        </button>
    );
};

export default Button;
