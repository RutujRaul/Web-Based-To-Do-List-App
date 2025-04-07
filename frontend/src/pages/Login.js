// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      navigate('/tasks'); // Redirect to tasks if already logged in
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      navigate('/tasks'); // Redirect to tasks page
    } else {
      setMessage(data.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login To Get Started!</h2>
      {message && <p className="auth-message">{message}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
      {/* Add a link to the signup page */}
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      {/* Add a link to the forgot password page */}
      <p><Link to="/forgot-password">Forgot password?</Link></p>
    </div>
  );
}

export default Login;
