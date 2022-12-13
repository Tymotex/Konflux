import { FirebaseOptions, getApp, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
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

        if (process.env.NODE_ENV === "production") {
            // Don't set up emulators.
        } else {
            // Set up emulators so that network requests hit a local copy of
            // Firebase services instead of the real thing.
            const db = getDatabase(app);
            connectDatabaseEmulator(db, "localhost", 9000);

            // See: https://firebase.google.com/docs/emulator-suite/connect_auth.
            const auth = getAuth();
            connectAuthEmulator(auth, "http://localhost:9099");
        }

        return app;
    }
}

export const firebaseApp = createFirebaseApp(firebaseInitConfig);
