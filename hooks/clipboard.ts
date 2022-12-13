import { useCallback } from "react";
import { spawnNotification } from "utils/notifications";

export const useCopyTextToClipboard = (text: string) => {
    const copyToClipboard = useCallback(
        () =>
            window.navigator.clipboard
                .writeText(text)
                .then(() => {
                    spawnNotification("success", "Copied to clipboard");
                })
                .catch((err) => {
                    spawnNotification(
                        "error",
                        `Couldn't copy to clipboard. Reason: ${err}`,
                    );
                }),
        [text],
    );
    return copyToClipboard;
};
