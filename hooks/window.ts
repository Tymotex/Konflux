import { useEffect, useState } from "react";

/**
 * Determines whether the screen width is below a given breakpoint.
 */
export const useBreakpointTrigger = (breakpoint: number): boolean => {
    const [width, setWidth] = useState<number>(0);

    // Initialise the width. Note: we must do this in `useEffect` since window
    // is undefined on the server side.
    useEffect(() => {
        setWidth(window.innerWidth);
    }, []);

    //
    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [width]);

    return width <= breakpoint;
};
