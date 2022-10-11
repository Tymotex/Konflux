import { Menu, MenuButton, MenuItem, MenuList } from "@reach/menu-button";
import { useDarkMode } from "contexts/ThemeProvider";
import { useRouter } from "next/router";
import React from "react";
import { useGlobalUser } from "utils/global-auth";
import styles from "./AvatarDropdown.module.scss";

interface Props {
    signOut: () => void;
    profilePicUrl: string;
}

const AvatarDropdown: React.FC<Props> = ({ signOut, profilePicUrl }) => {
    const router = useRouter();
    const isDarkMode = useDarkMode();
    const user = useGlobalUser();

    return user ? (
        <Menu>
            <MenuButton className={styles.btn}>
                <img
                    src={profilePicUrl}
                    className={styles.avatarImg}
                    alt={`${user.username} profile picture`}
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
    ) : (
        <></>
    );
};

export default AvatarDropdown;
