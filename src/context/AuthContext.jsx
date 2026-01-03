import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // Map Firebase user to our app's user structure
                setUser({
                    id: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName,
                    avatar: currentUser.photoURL
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // Kept for compatibility if used elsewhere, but practically unused with Google Auth only
    const login = async () => {
        console.warn("Email login not implemented with Firebase yet. Use Google.");
    };

    const signup = async () => {
        console.warn("Email signup not implemented with Firebase yet. Use Google.");
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithGoogle,
            login, // Fallback placeholders
            signup,
            logout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
