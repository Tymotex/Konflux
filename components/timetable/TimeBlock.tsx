import React, { useState } from "react";
import styles from "./Timetable.module.scss";

interface Props {
    style: React.CSSProperties;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onClick?: React.MouseEventHandler;
    TooltipContents?: React.ReactNode;
}

const TimeBlock: React.FC<Props> = ({
    style,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onClick,
}) => {
    return (
        <>
            <div
                className={`${styles.timeBlock}`}
                style={style}
                data-tip
                data-for="timetable-tooltip"
                onMouseEnter={(e) => {
                    if (onMouseEnter) onMouseEnter(e);
                }}
                onMouseLeave={(e) => {
                    if (onMouseLeave) onMouseLeave(e);
                }}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onClick={onClick}
            ></div>
        </>
    );
};

export default TimeBlock;
