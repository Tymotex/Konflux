import { Footer } from "components/footer";
import { PageTransition } from "components/page-transition";
import { TopNav } from "components/top-nav";
import React from "react";
import styles from "./PageLayout.module.scss";

interface Props {
    children: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }) => {
    return (
        <PageTransition>
            <div className={styles.container}>
                <TopNav />
                {children}
                <Footer />
            </div>
        </PageTransition>
    );
};

export default PageLayout;
