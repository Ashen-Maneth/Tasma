import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import InternalAuditorUI from './components/InternalAuditorUI';
import AuditManagerUI from './components/AuditManagerUI';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            setIsAuthenticated(true);
            setUserRole(role);
        }
    }, []);

    const setAuth = (auth, role) => {
        setIsAuthenticated(auth);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <Router>
            <div className="container-fluid">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <Link to="/" className="navbar-brand">Tasma</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav mr-auto">
                            {isAuthenticated && userRole === 'auditor' && (
                                <li className="navbar-item">
                                    <Link to="/auditor" className="nav-link">Internal Auditor</Link>
                                </li>
                            )}
                            {isAuthenticated && userRole === 'manager' && (
                                <li className="navbar-item">
                                    <Link to="/manager" className="nav-link">Audit Manager</Link>
                                </li>
                            )}
                        </ul>
                        {isAuthenticated && (
                            <button onClick={logout} className="btn btn-outline-danger my-2 my-sm-0">Logout</button>
                        )}
                    </div>
                </nav>
                <br />
                <Routes>
                    <Route path="/login" element={<Login setAuth={setAuth} />} />
                    <Route
                        path="/auditor"
                        element={
                            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="auditor">
                                <InternalAuditorUI />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/manager"
                        element={
                            <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="manager">
                                <AuditManagerUI />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
