import {
    Menu,
    MenuList,
    MenuButton,
    MenuItem,
    MenuItems,
    MenuPopover,
    MenuLink,
} from "@reach/menu-button";
import { useDarkMode } from "contexts/ThemeProvider";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { getProfilePicUrl, getUserName, signOutUser } from "utils/auth";
import styles from "./AvatarDropdown.module.scss";

interface Props {
    signOut: () => void;
}

const AvatarDropdown: React.FC<Props> = ({ signOut }) => {
    const router = useRouter();
    const profilePicUrl = useMemo(() => getProfilePicUrl(), []);

    const isDarkMode = useDarkMode();

    return (
        <Menu>
            <MenuButton className={styles.btn}>
                <img
                    src={profilePicUrl}
                    className={styles.avatarImg}
                    alt={`${getUserName()} profile picture`}
                />
            </MenuButton>
            <MenuList
                style={{
                    background: isDarkMode ? "#374151" : "white",
                    color: isDarkMode ? "white" : "#374151",
                }}
            >
                <MenuItem onSelect={() => router.push("/events")}>
                    My Events
                </MenuItem>
                <MenuItem onSelect={() => signOut()}>Sign Out</MenuItem>
            </MenuList>
        </Menu>
    );
};

export default AvatarDropdown;
