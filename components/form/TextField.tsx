import React, { RefObject, useCallback, useMemo, useState } from "react";
import styles from "./TextField.module.scss";
import Asterisk from "assets/icons/asterisk.svg";
import Info from "assets/icons/info.svg";
import { Tooltip } from "@reach/tooltip";
import { useDarkMode } from "hooks/theme";
import {
    Combobox,
    ComboboxInput,
    ComboboxList,
    ComboboxOption,
    ComboboxPopover,
} from "@reach/combobox";

interface Props {
    id: string;
    refHandle: RefObject<HTMLInputElement>;
    label?: string;
    type?: "text" | "password";
    placeholder?: string;
    required?: boolean;
    infoText?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    isTitle?: boolean;
    autocompleteItems?: Set<string>;
    hideRequiredIndicator?: boolean;
}

const TextField: React.FC<Props> = ({
    id,
    refHandle,
    type = "text",
    label = id,
    placeholder = "",
    required = false,
    infoText,
    value,
    onChange,
    isTitle,
    autocompleteItems,
    hideRequiredIndicator = false,
}) => {
    const isDarkMode = useDarkMode();

    const [matchesAnAutocompleteItem, setMatchesAnAutocompleteItem] =
        useState<boolean>();

    return !autocompleteItems ? (
        <div
            className={`${styles.inputContainer} ${
                isTitle ? styles.title : ""
            }`}
        >
            <div
                className={`${styles.label} ${isTitle ? styles.title : ""} ${
                    isDarkMode ? styles.dark : ""
                }`}
            >
                {required && !hideRequiredIndicator && (
                    <Asterisk className={styles.asterisk} />
                )}
                <label htmlFor={id}>{label}</label>
            </div>
            <div className={styles.textFieldContainer}>
                <input
                    id={id}
                    className={`${styles.textField} ${
                        isTitle ? styles.title : ""
                    } ${isDarkMode ? styles.dark : ""}`}
                    ref={refHandle}
                    required={required}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={"off"}
                    value={value}
                    onChange={onChange}
                />
                {infoText && (
                    <Tooltip
                        label={infoText}
                        aria-label={infoText}
                        style={{ zIndex: 100000 }}
                    >
                        <button className={styles.infoBtn}>
                            <Info />
                        </button>
                    </Tooltip>
                )}
            </div>
        </div>
    ) : (
        <div className={styles.inputContainer}>
            <div className={`${styles.label} ${isDarkMode ? styles.dark : ""}`}>
                {required && !hideRequiredIndicator && (
                    <Asterisk className={styles.asterisk} />
                )}
                <label id={id}>{label}</label>
            </div>
            <Combobox
                aria-labelledby={id}
                className={`${styles.textFieldContainer} ${styles.combobox}`}
                onSelect={(str) =>
                    setMatchesAnAutocompleteItem(autocompleteItems.has(str))
                }
            >
                <ComboboxInput
                    className={`${styles.textField} ${
                        isDarkMode ? styles.dark : ""
                    } ${matchesAnAutocompleteItem ? styles.matchesItem : ""}`}
                    placeholder={placeholder}
                    ref={refHandle}
                    onChange={(e) =>
                        setMatchesAnAutocompleteItem(
                            autocompleteItems.has(e.target.value),
                        )
                    }
                />
                {infoText && (
                    <Tooltip
                        label={infoText}
                        aria-label={infoText}
                        style={{ zIndex: 100000 }}
                    >
                        <button className={styles.infoBtn}>
                            <Info />
                        </button>
                    </Tooltip>
                )}
                <ComboboxPopover style={{ zIndex: 100000 }}>
                    <ComboboxList>
                        {autocompleteItems &&
                            Array.from(autocompleteItems).map((item) => (
                                <ComboboxOption
                                    key={item}
                                    value={item}
                                    style={{
                                        background: isDarkMode
                                            ? "#374151"
                                            : "white",
                                        color: isDarkMode ? "white" : "#374151",
                                    }}
                                />
                            ))}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    );
};

export default TextField;
