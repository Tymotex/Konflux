import Link from "next/link";
import React from "react";
import styles from "./Button.module.scss";

export interface ButtonProps {
    text: string;
    type?: "button" | "submit";
    size?: "md" | "lg";
    colour?: "primary" | "secondary";
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    shape?: "pill" | "box";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    internalUrl?: string;
    externalUrl?: string;
    // Adds an outline and inset box-shadow to the icon.
    iconInset?: boolean;
    ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
    text,
    type = "button",
    colour = "primary",
    size = "md",
    icon,
    iconPosition,
    shape = "box",
    internalUrl,
    externalUrl,
    iconInset = false,
    onClick,
    ariaLabel,
}) => {
    const ButtonCore = (
        <button
            onClick={onClick}
            className={`${styles.button} ${
                colour === "primary" ? styles.primary : styles.secondary
            } ${size === "lg" ? styles.lg : styles.md}`}
            type={type}
            style={{
                flexDirection: iconPosition === "left" ? "row" : "row-reverse",
                borderRadius: shape === "pill" ? 200 : 5,
            }}
            aria-label={ariaLabel}
        >
            {icon && (
                <span className={`${styles.icon} ${iconInset && styles.inset}`}>
                    {icon}
                </span>
            )}
            {text && <span>{text}</span>}
        </button>
    );
    const ButtonWithLink = externalUrl ? (
        <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.anchor}
            aria-label={ariaLabel}
        >
            {ButtonCore}
        </a>
    ) : internalUrl ? (
        <Link href={internalUrl} scroll={false}>
            <a aria-label={ariaLabel} style={{ textDecoration: "none" }}>
                {ButtonCore}
            </a>
        </Link>
    ) : (
        ButtonCore
    );

    return ButtonWithLink;
};

export default Button;
