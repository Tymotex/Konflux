import React from "react";
import styles from "./Container.module.scss";

interface Props {
    children: React.ReactNode;
    className?: string;
}

const Container: React.FC<Props> = ({ children, className }) => {
    return (
        <div className={`${styles.container} ${className ? className : ""}`}>
            {children}
        </div>
    );
};

export default Container;
