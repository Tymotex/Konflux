// See throttling function calls: https://remysharp.com/2010/07/21/throttling-function-calls/.
// export const delayCallAfterLastChange = (callback, delay) => {
//     let timer: any = null;
//     return function () {
//         const context: any = this;
//         const args = arguments;
//         clearTimeout(timer);
//         timer = window.setTimeout(function () {
//             callback.apply(context, args);
//         }, delay || 500);
//     };
// };

// function throttle(callback: any, delay: number = 500) {
//     let timer: any = null;
//     return function () {
//         const context: any = this;
//         const args = arguments;
//         clearTimeout(timer);
//         timer = window.setTimeout(function () {
//             callback.apply(context, args);
//         }, delay);
//     };
// }
