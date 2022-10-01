import { PageTransition } from "components/page-transition";
import { TopNav } from "components/top-nav";
import type { NextPage } from "next";

const AboutPage: NextPage = () => {
    return (
        <PageTransition>
            <h2>About</h2>
        </PageTransition>
    );
};

export default AboutPage;
