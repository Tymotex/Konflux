import Link from "next/link";
import React from "react";
import styles from "./Footer.module.scss";
import DividerIcon from "assets/icons/divider.svg";

interface Props {}

const Footer: React.FC<Props> = () => {
    return (
        <footer className={styles.footer}>
            <ul className={styles.footerItems}>
                <li>
                    <Link href="/feedback">
                        <a>Feedback or Feature Request</a>
                    </Link>
                </li>
                <DividerIcon className={styles.divider} />
                <li>Konflux &copy; 2022</li>
            </ul>
        </footer>
    );
};

export default Footer;
