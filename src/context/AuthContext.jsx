import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('pomodoro_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('pomodoro_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('pomodoro_user');
        }
    }, [user]);

    const login = (email, password) => {
        // Mock login
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const mockUser = {
                        id: 'user_123',
                        email: email,
                        name: email.split('@')[0],
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
                    };
                    setUser(mockUser);
                    resolve(mockUser);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 500); // Simulate network delay
        });
    };

    const signup = (email, password) => {
        // Mock signup - same as login for now
        return login(email, password);
    };

    const logout = () => {
        setUser(null);
    };

    const loginWithGoogle = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = {
                    id: 'google_user_kobayashi',
                    email: 'kobayashi@gmail.com',
                    name: 'Kobayashi',
                    avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
                };
                setUser(mockUser);
                resolve(mockUser);
            }, 800);
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithGoogle,
            signup,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
