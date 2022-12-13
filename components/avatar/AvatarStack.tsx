import { Tooltip } from "@reach/tooltip";
import { useDarkMode } from "hooks/theme";
import { EventMembers } from "models/event";
import React, { useMemo, useState } from "react";
import { AVATAR_PLACEHOLDER_URL } from "utils/global-auth";
import styles from "./AvatarStack.module.scss";

interface Props {
    users: EventMembers;
}

const MAX_AVATARS = 3;

const AvatarStack: React.FC<Props> = ({ users }) => {
    const isDarkMode = useDarkMode();
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

    const numMembers = useMemo(() => Object.keys(users || {})?.length, [users]);
    const avatarList = useMemo(() => {
        const usernamesAndProfilePics = Object.keys(users || {})?.map(
            (username) => [
                username,
                users[username].profilePicUrl || AVATAR_PLACEHOLDER_URL,
            ],
        );
        return [...usernamesAndProfilePics.slice(0, MAX_AVATARS)];
    }, [users]);

    return (
        <>
            <ul className={styles.stack}>
                {avatarList?.map(([username, picUrl]) => (
                    <Tooltip label={username} key={username}>
                        <li
                            className={styles.avatar}
                            style={{ backgroundImage: `url(${picUrl})` }}
                            data-tip
                            data-for="avatar-tooltip"
                            onMouseEnter={() => setIsHoveringAvatar(true)}
                            onMouseLeave={() => setIsHoveringAvatar(false)}
                        ></li>
                    </Tooltip>
                ))}
                {numMembers > MAX_AVATARS && (
                    <li
                        className={`${styles.avatar} ${styles.overflow} ${
                            isDarkMode ? styles.dark : ""
                        }`}
                        data-tip
                        data-for="avatar-tooltip"
                        onMouseEnter={() => setIsHoveringAvatar(true)}
                        onMouseLeave={() => setIsHoveringAvatar(false)}
                    >
                        <span className={styles.numMembers}>
                            +{numMembers - MAX_AVATARS}
                        </span>
                    </li>
                )}
            </ul>
        </>
    );
};

export default AvatarStack;
