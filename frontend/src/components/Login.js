import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        
        try {
            console.log('Attempting login with:', { username, password: '***' });
            const res = await api.post('/auth/login', { username, password });
            console.log('Login response:', res.data);
            
            const { token, role } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            setAuth(true, role);
            
            if (role === 'auditor') {
                navigate('/auditor');
            } else if (role === 'manager') {
                navigate('/manager');
            }
        } catch (err) {
            console.error('Login error:', err);
            
            // More detailed error messages
            if (err.response) {
                if (err.response.status === 400) {
                    setError('Invalid username or password');
                } else if (err.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(err.response.data?.msg || 'Login failed');
                }
            } else if (err.request) {
                setError('Cannot connect to server. Please check if the backend is running.');
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h3>Login</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            {/* Demo Credentials */}
                            <div className="alert alert-info">
                                <h6>Demo Credentials:</h6>
                                <small>
                                    <strong>Internal Auditor:</strong> AshenManeth / Pamuditha@23<br/>
                                    <strong>Manager:</strong> tasmaAudi / tasmaAudi123
                                </small>
                            </div>
                            
                            <form onSubmit={onSubmit}>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mt-3">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
