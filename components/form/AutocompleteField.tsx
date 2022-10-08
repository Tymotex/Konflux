import {
    Combobox,
    ComboboxInput,
    ComboboxList,
    ComboboxOption,
    ComboboxPopover,
} from "@reach/combobox";
import { useDarkMode } from "contexts/ThemeProvider";
import React, { RefObject } from "react";
import styles from "./TextField.module.scss";

interface Props {
    id: string;
    refHandle: RefObject<HTMLInputElement>;
    label?: string;
    required?: boolean;
    placeholder?: string;
    infoText?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    autocompleteItems: string[];
}

const AutocompleteField: React.FC<Props> = ({
    id,
    refHandle,
    label = id,
    required = false,
    placeholder,
    infoText,
    value,
    onChange,
    autocompleteItems,
}) => {
    const isDarkMode = useDarkMode();

    return (
        <div className={styles.inputContainer}>
            <label id={id}>{label}</label>
            <Combobox
                aria-labelledby={id}
                className={styles.textFieldContainer}
            >
                <ComboboxInput
                    className={styles.textField}
                    placeholder={placeholder}
                />
                <ComboboxPopover>
                    <ComboboxList>
                        {autocompleteItems.map((item) => (
                            <ComboboxOption key={item} value={item} />
                        ))}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    );
};

export default AutocompleteField;
