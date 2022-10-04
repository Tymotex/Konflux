import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import styles from "./DualRangeSlider.module.scss";
import { TIME_LABELS } from "components/timetable/timetable-utils";
import { useDarkMode } from "contexts/ThemeProvider";

interface Props {}

const DualRangeSlider: React.FC<Props> = () => {
    const [minVal, setMinVal] = useState<number>(18);
    const [maxVal, setMaxVal] = useState<number>(34);
    const minTimeGap = useMemo(() => 1, []);

    const isDarkMode = useDarkMode();

    const pushMinIfPast = useCallback(() => {
        if (maxVal < minVal + minTimeGap) {
            setMinVal(Math.max(minVal - minTimeGap, 0));
        }
    }, [minVal, maxVal, setMinVal]);

    const pushMaxIfPast = useCallback(() => {
        if (minVal > maxVal - minTimeGap) {
            setMaxVal(Math.min(maxVal + minTimeGap, 48));
        }
    }, [minVal, maxVal, setMaxVal]);

    useEffect(() => {
        pushMinIfPast();
        pushMaxIfPast();
    }, [pushMinIfPast, pushMaxIfPast]);

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
            <input
                type="range"
                min={0}
                max={48}
                value={minVal}
                className={styles.slider}
                id="lower"
                onChange={(e) => setMinVal(parseInt(e.target.value))}
            />
            <input
                type="range"
                min={0}
                max={48}
                value={maxVal}
                className={styles.slider}
                id="upper"
                onChange={(e) => setMaxVal(parseInt(e.target.value))}
            />
            <div className={styles.background} aria-hidden />
            <div
                aria-hidden
                className={styles.progress}
                style={{
                    width: `calc(${((maxVal - minVal) / 48) * 95}%)`,
                    left: `calc(${(minVal / 48) * 95}% + 10px)`,
                }}
            />
            <span
                className={styles.minLabel}
                style={{
                    left: `${(minVal / 48) * 95.7}%`, // Visually fine-tuned percentage.
                }}
                aria-label={"Earliest time"}
            >
                {TIME_LABELS[minVal]}
            </span>
            <span
                // When the two sliders and within a small enough distance,
                // invert the position of the max label so they don't
                // overlap.
                className={`${styles.maxLabel} ${
                    Math.abs(maxVal - minVal) < 12 ? styles.inverted : ""
                }`}
                aria-label={"Latest time"}
                style={{
                    left: `${(maxVal / 48) * 95.7}%`,
                }}
            >
                {TIME_LABELS[maxVal]}
            </span>
        </div>
    );
};

export default DualRangeSlider;
