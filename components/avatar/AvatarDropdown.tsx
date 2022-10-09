import {
    Menu,
    MenuList,
    MenuButton,
    MenuItem,
    MenuItems,
    MenuPopover,
    MenuLink,
} from "@reach/menu-button";
import { AuthContext } from "contexts/auth-context";
import { useDarkMode } from "contexts/ThemeProvider";
import { useRouter } from "next/router";
import React, { useContext, useMemo } from "react";
import { getProfilePicUrl, getUserName, signOutUser } from "utils/auth";
import styles from "./AvatarDropdown.module.scss";

interface Props {
    signOut: () => void;
    profilePicUrl: string;
}

const AvatarDropdown: React.FC<Props> = ({ signOut, profilePicUrl }) => {
    const router = useRouter();
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
