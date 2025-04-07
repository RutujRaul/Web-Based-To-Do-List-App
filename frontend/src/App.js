// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Heading from './pages/Heading';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import TaskList from './components/TaskList'; // TaskList includes AddTask internally
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/heading" element={<Heading />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route 
          path="/home" 
          element={
            <ProtectedRoute>S
              <Home />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <TaskList />  {/* AddTask is already inside TaskList */}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
