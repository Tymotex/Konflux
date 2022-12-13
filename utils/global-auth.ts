import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    User,
} from "firebase/auth";
import { EventMember } from "models/event";
import { createGlobalUserIfNotExist } from "models/global-user";
import { useEffect, useState } from "react";
import { spawnNotification } from "./notifications";

export const AVATAR_PLACEHOLDER_URL = "/avatar-placeholder.png";

// A static class containing utilities for signing in users 'globally' (that is,
// in a way that persists across sessions and is recognised app-wide rather than
// 'locally', where the user doesn't actually have an account and the
// credentials are scoped to just the one event they are registered to).
// Also lets you fetch information about the user such as their username,
// email, profile picture, etc.
export class GlobalAuth {
    static observerCallbacks: any[] = [];

    // Static classes can't be instantiated.
    constructor() {
        if (this instanceof GlobalAuth)
            throw new Error("Cannot instantiate GlobalAuth.");
    }

    static async signIn(
        signInData: GlobalAuthSignInRequest,
    ): Promise<EventMember | null> {
        let user: EventMember | null;
        switch (signInData.provider) {
            case "native": {
                const { email, password } = signInData;
                user = await GlobalAuth.nativeSignIn(email, password);
                break;
            }
            case "google":
                user = await GlobalAuth.googleSignIn();
                break;
            default:
                throw new Error(`Unknown provider.`);
        }

        // Note: it should be the case that the global user already exists in
        //       the database, however we'll insert them again just in case.
        createGlobalUserIfNotExist(user?.id);

        return user;
    }

    static async signUp(
        signUpData: GlobalAuthSignUpRequest,
    ): Promise<EventMember | null> {
        let user: EventMember | null;
        let userId: string;
        switch (signUpData.provider) {
            case "native": {
                user = await GlobalAuth.nativeSignUp(
                    signUpData.username,
                    signUpData.email,
                    signUpData.password,
                );
                break;
            }
            case "google":
                // Note: there is no `googleSignUp`, it's only `googleSignIn`.
                // Same applies to other external auth providers.
                user = await GlobalAuth.googleSignIn();
                break;
            default:
                throw new Error(`Unknown provider.`);
        }

        // Although Firebase is managing and storing user details, we still need
        // to track some data per user, such as the events they're members of.
        // The following has nothing to do with Firebase Auth.
        createGlobalUserIfNotExist(user?.id);

        return user;
    }

    /**
     * Sign out the user.
     * @returns
     */
    static async signOut() {
        return firebaseSignOut(getAuth());
    }

    /**
     * Invokes the given event handler when the user changes, due to signing
     * in, signing out, or changing one of their fields such as display name.
     * @param eventHandler
     */
    static onUserChange(eventHandler: (user: EventMember | null) => void) {
        // Unfortunately, `onAuthStateChanged` does not trigger when the user's
        // display name or other fields change. We need to manually push
        // updates to observers as well.
        GlobalAuth.observerCallbacks.push(eventHandler);
        onAuthStateChanged(getAuth(), (firebaseUser: User | null) => {
            if (firebaseUser === null) {
                eventHandler(null);
                return;
            }
            // Convert firebase's User model into our 'EventMember' model.
            eventHandler(GlobalAuth.firebaseUserToEventUser(firebaseUser));
        });
    }

    private static disseminate(newUser: EventMember) {
        GlobalAuth.observerCallbacks.forEach((f) => f(newUser));
    }

    private static firebaseUserToEventUser(firebaseUser: User): EventMember {
        if (!firebaseUser.email)
            throw new Error("Expected user model to have an email.");

        return {
            id: firebaseUser.uid,
            scope: "global",
            username: firebaseUser.displayName || "",
            email: firebaseUser.email,
            password: "TODO:wtfToDoWhenGloballyAuthed",
            profilePicUrl: firebaseUser.photoURL || AVATAR_PLACEHOLDER_URL,
        };
    }

    /**
     * Attempt to sign in the user with the provided details without using an
     * external provider.
     * @param email
     * @param password
     */
    private static async nativeSignIn(
        email: string,
        password: string,
    ): Promise<EventMember | null> {
        const userCreds = await signInWithEmailAndPassword(
            getAuth(),
            email,
            password,
        );
        spawnNotification("success", "Welcome back.");
        const authUser = GlobalAuth.firebaseUserToEventUser(userCreds.user);
        GlobalAuth.disseminate(authUser);
        return authUser;
    }

    /**
     * Initiate an Google's OAuth flow.
     * @returns the user object and the user ID.
     */
    private static async googleSignIn(): Promise<EventMember | null> {
        const provider = new GoogleAuthProvider();
        const userCreds = await signInWithPopup(getAuth(), provider);
        spawnNotification("success", "You've signed in with Google. Welcome!");

        const authUser = GlobalAuth.firebaseUserToEventUser(userCreds.user);
        GlobalAuth.disseminate(authUser);
        return authUser;
    }

    /**
     * Attempt to sign up the user with the provided details without using an
     * an external provider.
     * @param username
     * @param email
     * @param password
     */
    private static async nativeSignUp(
        username: string,
        email: string,
        password: string,
    ): Promise<EventMember | null> {
        if (!username) {
            throw new Error("Please set a username.");
        } else if (username.length > 64) {
            throw new Error(
                "Please set a username less than 64 characters long.",
            );
        }

        const userCreds = await createUserWithEmailAndPassword(
            getAuth(),
            email,
            password,
        );

        // Set the display name.
        await updateProfile(userCreds.user, {
            displayName: username,
        });

        spawnNotification("success", `You've signed up. Welcome ${username}!`);

        const authUser = GlobalAuth.firebaseUserToEventUser(userCreds.user);
        GlobalAuth.disseminate(authUser);
        return authUser;
    }
}

export type GlobalAuthSignInRequest =
    | { provider: "native"; email: string; password: string }
    | { provider: "google" };

export type GlobalAuthSignUpRequest =
    | { provider: "native"; username: string; email: string; password: string }
    | { provider: "google" };

// A custom React hook for accessing the globally authenticated user.
export const useGlobalUser = (): EventMember | null => {
    const [user, setUser] = useState<EventMember | null>(null);

    useEffect(() => {
        GlobalAuth.onUserChange((newUser) => setUser(newUser));
    }, [setUser]);

    return user;
};
