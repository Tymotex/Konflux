import { FirebaseOptions, getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

const firebaseInitConfig = {
    apiKey: "AIzaSyCWYC8b93kQS7XbiBNPSoA2BR4H4BuUagQ",
    authDomain: "konflux-services.firebaseapp.com",
    projectId: "konflux-services",
    appId: "1:177358484116:web:d0c2e574007c895bd5ba81",
    databaseURL:
        "https://konflux-services-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

function createFirebaseApp(config: FirebaseOptions) {
    try {
        return getApp();
    } catch {
        const app = initializeApp(config);
        const db = getDatabase(app);
        connectDatabaseEmulator(db, "localhost", 9000);
        return app;
    }
}

const firebaseApp = createFirebaseApp(firebaseInitConfig);

export const auth = getAuth(firebaseApp);
