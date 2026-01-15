import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import GenerateContent from './pages/GenerateContent';
import History from './pages/History';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Community from './pages/Community';
import Admin from './pages/Admin';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return user.role === 'admin' ? children : <Navigate to="/dashboard" />;
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
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />

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
                            <Route path="/community" element={
                                <PrivateRoute>
                                    <Community />
                                </PrivateRoute>
                            } />
                            <Route path="/progress" element={
                                <PrivateRoute>
                                    <Progress />
                                </PrivateRoute>
                            } />
                            <Route path="/profile" element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } />
                            <Route path="/admin" element={
                                <AdminRoute>
                                    <Admin />
                                </AdminRoute>
                            } />
                        </Routes>
                    </div>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
