import { initializeApp } from "firebase/app";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseInitConfig = {
    apiKey: "AIzaSyCWYC8b93kQS7XbiBNPSoA2BR4H4BuUagQ",
    authDomain: "konflux-services.firebaseapp.com",
    projectId: "konflux-services",
    appId: "1:177358484116:web:d0c2e574007c895bd5ba81",
    databaseURL:
        "https://konflux-services-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

export const app = initializeApp(firebaseInitConfig);

export const db = getDatabase(app);
export const connectToLocalEmulator = () => {
    // Point to the RTDB emulator running on localhost.
    // See: https://firebase.google.com/docs/emulator-suite/connect_and_prototype?database=RTDB#web-version-9.
    connectDatabaseEmulator(db, "localhost", 9000);
};

export const auth = getAuth(app);
