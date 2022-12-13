import React from "react";
import LogoLight from "public/logo-light.svg";
import LogoDark from "public/logo-dark.svg";
import { useDarkMode } from "hooks/theme";
import { useRouter } from "next/router";
import styles from "./Logo.module.scss";

interface Props {
    size?: number;
    className?: string;
}

const Logo: React.FC<Props> = ({ size, className }) => {
    const isDarkMode = useDarkMode();
    const router = useRouter();

    return isDarkMode ? (
        <LogoDark
            className={`${styles.brandIcon} ${className ? className : ""}`}
            onClick={() => router.push("/")}
            style={{ height: size, width: size }}
        />
    ) : (
        <LogoLight
            className={`${styles.brandIcon} ${className ? className : ""}`}
            onClick={() => router.push("/")}
            style={{ height: size, width: size }}
        />
    );
};

export default Logo;
