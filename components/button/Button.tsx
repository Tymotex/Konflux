import React from "react";
import styles from "./Button.module.scss";

interface Props {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    style?: React.CSSProperties;
}

const Button: React.FC<Props> = ({ children, onClick, style }) => {
    return (
        <button className={styles.btn} onClick={onClick} style={style}>
            {children}
        </button>
    );
};

export default Button;
