import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { spawnNotification } from "./notifications";

const AVATAR_PLACEHOLDER_URL = "/avatar-placeholder.png";

/**
 * Attempt to sign up the user with the provided details without using an
 * an external provider.
 * @param username
 * @param email
 * @param password
 */
export const nativeSignUp = async (
    username: string,
    email: string,
    password: string,
) => {
    if (!username) {
        throw new Error("Please set a username.");
    } else if (username.length > 64) {
        throw new Error("Please set a username less than 64 characters long.");
    }

    const result = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password,
    );

    // Set the display name.
    await updateProfile(result.user, {
        displayName: username,
    });

    spawnNotification("success", `You've signed up. Welcome ${username}!`);
};

/**
 * Attempt to sign in the user with the provided details without using an
 * external provider.
 * @param email
 * @param password
 */
export const nativeSignIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getAuth(), email, password);

    spawnNotification("success", "Welcome back.");
};

/**
 * Initiate an external provider's OAuth flow.
 * @param providerName
 */
export const authProviderSignIn = async (providerName: "google") => {
    let provider;
    switch (providerName) {
        case "google":
            provider = new GoogleAuthProvider();
            break;
        default:
            throw new Error(`Unknown provider ${providerName}.`);
    }
    await signInWithPopup(getAuth(), provider);

    spawnNotification(
        "success",
        `You've signed in with ${providerName}. Welcome!`,
    );
};

/**
 * Sign out the user.
 * @returns
 */
export const signOutUser = () => {
    return signOut(getAuth());
};

/**
 * Determine whether the user is signed in or not.
 * @returns
 */
export const isUserSignedIn = () => !!getAuth().currentUser;

/**
 * Fetches the user's ID.
 * @returns
 */
export const getUserId = (): string => {
    const auth = getAuth();
    return auth.currentUser?.uid || "";
};

/**
 * Fetches the user's profile picture, defaulting to a placeholder image URL
 * if it doesn't exist.
 * @returns
 */
export const getProfilePicUrl = (): string => {
    const auth = getAuth();
    if (!auth) return AVATAR_PLACEHOLDER_URL;
    return auth.currentUser?.photoURL || AVATAR_PLACEHOLDER_URL;
};

/**
 * Fetches the user's display name.
 * @returns
 */
export const getUserName = (): string => {
    const auth = getAuth();
    if (!auth) return AVATAR_PLACEHOLDER_URL;
    return auth.currentUser?.displayName || AVATAR_PLACEHOLDER_URL;
};
