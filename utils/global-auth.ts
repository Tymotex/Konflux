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
    // Static classes can't be instantiated.
    constructor() {
        if (this instanceof GlobalAuth)
            throw new Error("Cannot instantiate GlobalAuth.");
    }

    static signIn(
        signInData: GlobalAuthSignInRequest,
    ): Promise<EventMember | null> {
        switch (signInData.provider) {
            case "native": {
                const { email, password } = signInData;
                return GlobalAuth.nativeSignIn(email, password);
            }
            case "google":
                return GlobalAuth.googleSignIn();
            default:
                throw new Error(`Unknown provider.`);
        }
    }

    static signUp(
        signUpData: GlobalAuthSignUpRequest,
    ): Promise<EventMember | null> {
        switch (signUpData.provider) {
            case "native": {
                return GlobalAuth.nativeSignUp(
                    signUpData.username,
                    signUpData.email,
                    signUpData.password,
                );
            }
            case "google":
                // Note: there is no `googleSignUp`, it's only `googleSignIn`.
                // Same applies to other external auth providers.
                return GlobalAuth.googleSignIn();
            default:
                throw new Error(`Unknown provider.`);
        }
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
        onAuthStateChanged(getAuth(), (firebaseUser: User | null) => {
            if (firebaseUser === null) {
                eventHandler(null);
                return;
            }

            // Convert firebase's User model into our 'EventMember' model.
            eventHandler(GlobalAuth.firebaseUserToEventUser(firebaseUser));
        });
    }

    private static firebaseUserToEventUser(firebaseUser: User): EventMember {
        // if (!firebaseUser.displayName)
        //     throw new Error("Expected user model to have a display name.");
        if (!firebaseUser.email)
            throw new Error("Expected user model to have an email.");
        return {
            scope: "global",
            username: firebaseUser.displayName || "",
            email: firebaseUser.email,
            isOwner: false,
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
        try {
            const userCreds = await signInWithEmailAndPassword(
                getAuth(),
                email,
                password,
            );
            spawnNotification("success", "Welcome back.");
            return GlobalAuth.firebaseUserToEventUser(userCreds.user);
        } catch (err) {
            spawnNotification("error", (err as Error).message);
            return null;
        }
    }

    /**
     * Initiate an Google's OAuth flow.
     */
    private static async googleSignIn(): Promise<EventMember | null> {
        try {
            const provider = new GoogleAuthProvider();
            const userCreds = await signInWithPopup(getAuth(), provider);
            spawnNotification(
                "success",
                "You've signed in with Google. Welcome!",
            );
            return GlobalAuth.firebaseUserToEventUser(userCreds.user);
        } catch (err) {
            spawnNotification("error", (err as Error).message);
            return null;
        }
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
        try {
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

            spawnNotification(
                "success",
                `You've signed up. Welcome ${username}!`,
            );

            return GlobalAuth.firebaseUserToEventUser(userCreds.user);
        } catch (err) {
            spawnNotification("error", (err as Error).message);
            return null;
        }
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
        GlobalAuth.onUserChange(setUser);
    }, [setUser]);

    return user;
};
