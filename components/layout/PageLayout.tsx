import { Footer } from "components/footer";
import { PageTransition } from "components/page-transition";
import { TopNav } from "components/top-nav";
import { LocalAuthContext } from "contexts/local-auth-context";
import { useDarkMode } from "hooks/theme";
import React, { useContext } from "react";
import styles from "./PageLayout.module.scss";

interface Props {
    children: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }) => {
    const isDarkMode = useDarkMode();

    return (
        <div
            className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}
            id="content-container"
        >
            <TopNav />
            {children}
            <Footer />
        </div>
    );
};

export default PageLayout;
