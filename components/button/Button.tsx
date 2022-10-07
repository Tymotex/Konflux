import React from "react";
import styles from "./Button.module.scss";

interface Props {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    style?: React.CSSProperties;
    className?: string;
}

const Button: React.FC<Props> = ({ children, onClick, style, className }) => {
    return (
        <button
            className={`${styles.btn} ${className ? className : ""}`}
            onClick={onClick}
            style={style}
        >
            {children}
        </button>
    );
};

export default Button;
