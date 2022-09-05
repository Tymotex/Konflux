import React, { MouseEvent } from "react";
import styles from "./Timetable.module.scss";

interface Props {
    colourScale: string[];
    onItemClick: (
        event: MouseEvent<HTMLLIElement>,
        numAvailable: number,
    ) => void;
}

const AvailabilityLegend: React.FC<Props> = ({ colourScale, onItemClick }) => {
    return (
        <div>
            <ol className={styles.availabilityLegend}>
                {colourScale?.map((colour, i) => (
                    <li
                        key={colour}
                        className={styles.availabilityChip}
                        onClick={(e) => onItemClick(e, i)}
                    >
                        <div
                            style={{
                                backgroundColor: colour,
                            }}
                            className={styles.colour}
                        ></div>
                        <div className={styles.label}>{`${i}/${
                            colourScale.length - 1
                        } available`}</div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default AvailabilityLegend;
