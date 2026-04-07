import { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_ROUTES, ROLES } from '../constants/roles';
import { initSocket, disconnectSocket } from '../services/socketService';

const AuthContext = createContext(null);

const STORAGE_KEY = 'gmrit-auth';

export function AuthProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');
    const [auth, setAuth] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.token) return { ...parsed, isAuthenticated: true };
            }
        } catch { /* ignore */ }
        return { email: null, role: null, isAuthenticated: false, user: null };
    });

    useEffect(() => {
        document.body.classList.toggle('theme-dark', theme === 'dark');
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    useEffect(() => {
        if (auth.isAuthenticated) {
            initSocket(auth);
        } else {
            disconnectSocket();
        }
    }, [auth.isAuthenticated]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const login = (userData, token) => {
        const authData = { ...userData, token, isAuthenticated: true };
        setAuth(authData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    };

    const logout = () => {
        disconnectSocket();
        setAuth({ email: null, role: null, isAuthenticated: false, user: null, token: null });
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.clear(); // ensuring full clean up
    };

    const getRoleRedirect = (role) => ROLE_ROUTES[role] || '/';

    return (
        <AuthContext.Provider value={{ ...auth, login, logout, getRoleRedirect, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
