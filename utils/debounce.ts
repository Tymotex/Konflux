// See throttling/debouncing function calls:
// - https://remysharp.com/2010/07/21/throttling-function-calls/.
// - https://webdesign.tutsplus.com/tutorials/javascript-debounce-and-throttle--cms-36783
export const debounce = <Args>(
    callback: (payload: Args) => void,
    delay: number,
): ((payload: Args) => void) => {
    let timer: any;
    return (payload: Args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            callback(payload);
        }, delay);
    };
};
