import { toast } from "react-toastify";

export const spawnNotification = (
    type: "success" | "info" | "warning" | "error",
    message: string,
) => {
    try {
        switch (type) {
            case "success":
                toast.success(message, { toastId: message });
                break;
            case "info":
                toast.info(message, { toastId: message });
                break;
            case "warning":
                toast.warning(message, { toastId: message });
                break;
            case "error":
                toast.error(message, {
                    toastId: message,
                    autoClose: false,
                    closeOnClick: false,
                });
                console.error(message);
                break;
            default:
                throw new Error(`Unknown notification type: '${type}'`);
        }
    } catch (err) {
        console.error(err);
    }
};

/**
 * Spawns a pending notification that can either become successful and display
 * a success message or fail and display an error message.
 *
 * The error message need not be set explicitly, by default it uses the error
 * 'thrown' by the failed promise. Specify an error message to override this.
 *
 * @param promise
 * @param options
 * @returns whatever the given promise wraps around
 */
export const spawnPromiseNotification = async <T>(
    promise: Promise<T> | (() => Promise<T>),
    options?: {
        pendingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
    },
): Promise<T | Error> => {
    try {
        return await toast.promise(
            promise instanceof Function ? promise : () => promise,
            {
                pending: options?.pendingMessage || "Pending...",
                success: options?.successMessage || "Success!",
                error: options?.errorMessage || {
                    render({ data }) {
                        return data.message || "Failure.";
                    },
                },
            },
        );
    } catch (err) {
        return err as Error;
    }
};
