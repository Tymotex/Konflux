import { Container } from "components/container";
import { PageTransition } from "components/page-transition";
import type { NextPage } from "next";

const FeatureRequestPage: NextPage = () => {
    return (
        <PageTransition>
            <Container>
                <div style={{ textAlign: "center" }}>
                    <h1>Feature Request</h1>
                    <p>Fill out the form below 😃.</p>
                </div>
                <iframe
                    style={{
                        margin: "0 auto",
                        display: "block",
                        background: "whitesmoke",
                        borderRadius: "12px",
                    }}
                    src="https://docs.google.com/forms/d/e/1FAIpQLSfKeFc2MF8mEICPbAesdx3FVCV12uEhki7TBHXoWwUPYI6ELA/viewform?embedded=true"
                    width={640}
                    height={800}
                    frameBorder={0}
                    marginHeight={0}
                    marginWidth={0}
                >
                    Loading…
                </iframe>
            </Container>
        </PageTransition>
    );
};

export default FeatureRequestPage;
