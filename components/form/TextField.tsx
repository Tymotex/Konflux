import React, { RefObject } from "react";
import styles from "./TextField.module.scss";
import Asterisk from "./asterisk.svg";
import Info from "./info.svg";

interface Props {
    id: string;
    refHandle: RefObject<HTMLInputElement>;
    label?: string;
    type?: "text" | "password";
    placeholder?: string;
    required?: boolean;
    infoText?: string;
}

const TextField: React.FC<Props> = ({
    id,
    refHandle,
    type = "text",
    label = id,
    placeholder = "",
    required = false,
    infoText,
}) => {
    return (
        <div className={styles.inputContainer}>
            <div className={styles.label}>
                {required && <Asterisk className={styles.asterisk} />}
                <label htmlFor={id} className={styles.labelText}>
                    {label}
                </label>
            </div>
            <div className={styles.textFieldContainer}>
                <input
                    id={id}
                    className={styles.textField}
                    ref={refHandle}
                    required={required}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={"off"}
                />
                {infoText && <Info className={styles.info} />}
            </div>
        </div>
    );
};

export default TextField;
