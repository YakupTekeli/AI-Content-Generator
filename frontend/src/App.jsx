import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import GenerateContent from './pages/GenerateContent';
import History from './pages/History';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <div className="flex-grow container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Private Routes */}
                            <Route path="/dashboard" element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/generate" element={
                                <PrivateRoute>
                                    <GenerateContent />
                                </PrivateRoute>
                            } />
                            <Route path="/history" element={
                                <PrivateRoute>
                                    <History />
                                </PrivateRoute>
                            } />
                            <Route path="/profile" element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } />
                        </Routes>
                    </div>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
