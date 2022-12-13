import { Button } from "components/button";
import { PageTransition } from "components/page-transition";
import { TopNav } from "components/top-nav";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "./Error404.module.scss";

const NotFoundPage: NextPage = () => {
    const router = useRouter();

    return (
        <PageTransition>
            <div className={styles.container}>
                <h2>404 Not found</h2>
                <Button
                    colour="primary"
                    size="md"
                    onClick={() => router.push("/")}
                >
                    Go Home
                </Button>
            </div>
        </PageTransition>
    );
};

export default NotFoundPage;
