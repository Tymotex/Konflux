import { PageTransition } from "components/page-transition";
import { TopNav } from "components/top-nav";
import type { NextPage } from "next";

const NotFoundPage: NextPage = () => {
    return (
        <PageTransition>
            <h2>404 Not found</h2>
        </PageTransition>
    );
};

export default NotFoundPage;
