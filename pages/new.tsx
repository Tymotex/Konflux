import { PageTransition } from "components/page-transition";
import type { NextPage } from "next";

const Home: NextPage = () => {
    return (
        <PageTransition>
            <h1>New Event</h1>
        </PageTransition>
    );
};

export default Home;
