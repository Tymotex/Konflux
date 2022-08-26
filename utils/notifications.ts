import { toast } from "react-toastify";

export const spawnNotification = (
    type: "success" | "info" | "warning" | "error",
    message: string,
) => {
    switch (type) {
        case "success":
            toast.success(message);
            break;
        case "info":
            toast.info(message);
            break;
        case "warning":
            toast.warning(message);
            break;
        case "error":
            toast.error(message);
            break;
        default:
            throw new Error(`Unknown notification type: '${type}'`);
    }
};
