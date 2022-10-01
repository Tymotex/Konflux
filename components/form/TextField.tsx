import React, { RefObject } from "react";
import styles from "./TextField.module.scss";
import Asterisk from "./asterisk.svg";
import Info from "./info.svg";
import { Tooltip } from "@reach/tooltip";
import { useDarkMode } from "contexts/ThemeProvider";

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
    const isDarkMode = useDarkMode();

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
                    className={`${styles.textField} ${
                        isDarkMode ? styles.dark : ""
                    }`}
                    ref={refHandle}
                    required={required}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={"off"}
                />
                {infoText && (
                    <Tooltip label={infoText} aria-label={infoText}>
                        <button className={styles.infoBtn}>
                            <Info />
                        </button>
                    </Tooltip>
                )}
            </div>
        </div>
    );
};

export default TextField;
