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
    size?: "sm" | "md";
}

const Button: React.FC<Props> = ({
    children,
    onClick,
    style,
    className,
    isSubmit = false,
    colour = "primary",
    Icon,
    size = "md",
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
            } ${className ? className : ""} ${isDarkMode ? styles.dark : ""} ${
                size === "sm" ? styles.sm : size === "md" ? styles.md : ""
            }`}
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
