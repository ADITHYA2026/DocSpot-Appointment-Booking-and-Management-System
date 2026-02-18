import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';
import './App.css';

// Layout Components
import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import DoctorsList from './pages/DoctorsList';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorProfile from './pages/DoctorProfile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageDoctors from './pages/ManageDoctors';
import ManageAppointments from './pages/ManageAppointments';

// Common Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// FIX 9: Import the new stub pages for missing routes
// These were linked in Register.js and Login.js but had no route definitions,
// causing a 404 / NotFound render when clicked.
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<DoctorsList />} />

            {/* FIX 9: Previously missing routes — linked in Register & Login but undefined */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/book-appointment/:doctorId" element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            } />
            <Route path="/my-appointments" element={
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            } />

            {/* Protected Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/appointments" element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorAppointments />
              </ProtectedRoute>
            } />
            <Route path="/doctor/profile" element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorProfile />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/doctors" element={
              <ProtectedRoute requiredRole="admin">
                <ManageDoctors />
              </ProtectedRoute>
            } />
            <Route path="/admin/appointments" element={
              <ProtectedRoute requiredRole="admin">
                <ManageAppointments />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;