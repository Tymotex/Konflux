import { useDarkMode } from "hooks/theme";
import { EventMembers } from "models/event";
import React, { useMemo } from "react";
import { AVATAR_PLACEHOLDER_URL } from "utils/global-auth";
import styles from "./AvatarStack.module.scss";

interface Props {
    users: EventMembers;
}

const MAX_AVATARS = 3;

const AvatarStack: React.FC<Props> = ({ users }) => {
    const isDarkMode = useDarkMode();

    const numMembers = useMemo(() => Object.keys(users || {})?.length, [users]);
    const profilePicUrls = useMemo(() => {
        const allProfilePics = Object.values(users || {}).map(
            (userInfo) => userInfo.profilePicUrl || AVATAR_PLACEHOLDER_URL,
        );
        return [...allProfilePics.slice(0, MAX_AVATARS)];
    }, [users, numMembers]);

    return (
        <ul className={styles.stack}>
            {profilePicUrls?.map((picUrl) => (
                <li
                    className={styles.avatar}
                    style={{ backgroundImage: `url(${picUrl})` }}
                ></li>
            ))}
            {numMembers > MAX_AVATARS && (
                <li
                    className={`${styles.avatar} ${styles.overflow} ${
                        isDarkMode ? styles.dark : ""
                    }`}
                >
                    <span className={styles.numMembers}>
                        +{numMembers - MAX_AVATARS}
                    </span>
                </li>
            )}
        </ul>
    );
};

export default AvatarStack;
