"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/axios";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.post("/api/v1/auth/refresh");
                window.__accessToken = data.accessToken;
                setUser(data.user);
            } catch (error) {
                window.__accessToken = null;
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post("/api/v1/auth/login", { email, password });
        window.__accessToken = data.accessToken;
        setUser(data.user);
        return data.user
    };

    const register = async (name: string, email: string, password: string) => {
        const { data } = await api.post("/api/v1/auth/register", { name, email, password });
        window.__accessToken = data.accessToken;
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await api.post("/api/v1/auth/logout");
        } finally {
            window.__accessToken = null;
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );

}

export function useAuth () {
    const cxt = useContext(AuthContext);
    if(!cxt) throw new Error("useAuth must be used inside AuthProvider");
    return cxt;
}
