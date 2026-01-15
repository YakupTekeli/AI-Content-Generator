import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    };
                    const { data } = await axios.get('/api/auth/me', config);
                    if (data.success) {
                        setUser(data.data);
                    } else {
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            if (data.success) {
                localStorage.setItem('token', data.token);
                // The API returns the user object directly mixed with token? 
                // No, controller says: _id, name, email, role, token...
                // Let's refetch me or just construct user.
                // Controller returns key user info.
                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    status: data.status,
                    interests: data.interests,
                    languageLevel: data.languageLevel,
                    resetKey: data.resetKey
                });
                return { success: true, user: data };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('/api/auth/register', { name, email, password });
            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    resetKey: data.resetKey
                });
                return { success: true, user: data };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
