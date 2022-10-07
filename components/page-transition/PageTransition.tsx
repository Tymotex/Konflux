import React from "react";
import { motion } from "framer-motion";

interface Props {
    children: React.ReactNode;
}

const PageTransition: React.FC<Props> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            // Full viewport height minus the height of the topnav and space
            // for the footerfooter.
            style={{ minHeight: "calc(100vh - 56px - 60px)" }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
