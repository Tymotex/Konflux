import React from "react";
import styles from "./Button.module.scss";

interface Props {
    children: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<Props> = ({ children, onClick }) => {
    return (
        <button className={styles.btn} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;
