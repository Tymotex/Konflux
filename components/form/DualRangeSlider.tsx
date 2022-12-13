import { TIME_LABELS } from "components/timetable/timetable-utils";
import { useDarkMode } from "hooks/theme";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./DualRangeSlider.module.scss";

interface Props {
    defaultMinVal: number;
    defaultMaxVal: number;
    totalVals: number;
    minGap?: number;
    onChange: (minVal: number, maxVal: number) => void;
}

// These global variables are used to prevent infinite looping in issue #60.
// See: https://github.com/Tymotex/Konflux/issues/60.
let prevLeftVal: number | undefined;
let prevRightVal: number | undefined;

const DualRangeSlider: React.FC<Props> = ({
    defaultMinVal,
    defaultMaxVal,
    totalVals,
    minGap = 2,
    onChange,
}) => {
    const [leftSliderVal, setLeftSliderVal] = useState<number>(defaultMinVal);
    const [rightSliderVal, setRightSliderVal] = useState<number>(defaultMaxVal);

    const isDarkMode = useDarkMode();

    const pushMinIfPast = useCallback(() => {
        if (rightSliderVal < leftSliderVal + minGap) {
            setLeftSliderVal(Math.max(leftSliderVal - minGap, 0));
        }
    }, [leftSliderVal, rightSliderVal, setLeftSliderVal, minGap]);

    const pushMaxIfPast = useCallback(() => {
        if (leftSliderVal > rightSliderVal - minGap) {
            setRightSliderVal(Math.min(rightSliderVal + minGap, totalVals));
        }
    }, [leftSliderVal, rightSliderVal, setRightSliderVal, minGap, totalVals]);

    useEffect(() => {
        pushMinIfPast();
        pushMaxIfPast();
    }, [leftSliderVal, rightSliderVal, pushMinIfPast, pushMaxIfPast]);

    useEffect(() => {
        const inBounds = leftSliderVal + minGap < rightSliderVal;
        if (
            inBounds &&
            !(prevLeftVal === leftSliderVal && prevRightVal === rightSliderVal)
        ) {
            prevLeftVal = leftSliderVal;
            prevRightVal = rightSliderVal;

            onChange(leftSliderVal, rightSliderVal);
        }
    }, [leftSliderVal, rightSliderVal, minGap, onChange]);

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
            <input
                type="range"
                min={0}
                max={totalVals}
                value={leftSliderVal}
                className={styles.slider}
                id="lower"
                onChange={(e) => setLeftSliderVal(parseInt(e.target.value))}
            />
            <input
                type="range"
                min={0}
                max={totalVals}
                value={rightSliderVal}
                className={styles.slider}
                id="upper"
                onChange={(e) => setRightSliderVal(parseInt(e.target.value))}
            />
            <div className={styles.background} aria-hidden />
            <div
                aria-hidden
                className={styles.progress}
                style={{
                    width: `calc(${
                        ((rightSliderVal - leftSliderVal) / totalVals) * 95
                    }%)`,
                    left: `calc(${(leftSliderVal / totalVals) * 95}% + 10px)`,
                }}
            />
            <span
                className={styles.minLabel}
                style={{
                    left: `${(leftSliderVal / totalVals) * 95.7}%`, // Visually fine-tuned percentage.
                }}
                aria-label={"Earliest time"}
            >
                {TIME_LABELS[leftSliderVal]}
            </span>
            <span
                // When the two sliders and within a small enough distance,
                // invert the position of the max label so they don't
                // overlap.
                className={`${styles.maxLabel} ${
                    Math.abs(rightSliderVal - leftSliderVal) < 12
                        ? styles.inverted
                        : ""
                }`}
                aria-label={"Latest time"}
                style={{
                    left: `${(rightSliderVal / totalVals) * 95.7}%`,
                }}
            >
                {TIME_LABELS[rightSliderVal]}
            </span>
        </div>
    );
};

export default DualRangeSlider;
