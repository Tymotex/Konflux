import { useDarkMode } from "contexts/ThemeProvider";
import React, { MouseEvent } from "react";
import AvailabilityItem from "./AvailabilityItem";
import styles from "./AvailabilityLegend.module.scss";

interface Props {
    colourScale: string[];
    showFilter: (
        event: MouseEvent,
        numAvailable: number,
        state?: boolean,
    ) => void;
}

const AvailabilityLegend: React.FC<Props> = ({ colourScale, showFilter }) => {
    const isDarkMode = useDarkMode();

    return (
        <div className={styles.container}>
            <ol
                className={`${styles.availabilityLegend} ${
                    isDarkMode ? styles.dark : ""
                }`}
            >
                {colourScale?.map((colour, i) => (
                    <AvailabilityItem
                        colour={colour}
                        numAvailable={i}
                        totalAvailable={colourScale.length - 1}
                        showFilter={showFilter}
                    />
                ))}
            </ol>
        </div>
    );
};

export default AvailabilityLegend;
