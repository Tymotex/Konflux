import React from "react";
import styles from "./Button.module.scss";

interface Props {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    style?: React.CSSProperties;
    className?: string;
    isSubmit?: boolean;
}

const Button: React.FC<Props> = ({
    children,
    onClick,
    style,
    className,
    isSubmit = false,
}) => {
    return (
        <button
            className={`${styles.btn} ${className ? className : ""}`}
            onClick={onClick}
            style={style}
            type={isSubmit ? "submit" : "button"}
        >
            {children}
        </button>
    );
};

export default Button;
