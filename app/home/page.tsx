'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import ProtectedRoute from '../components/ProtectedRoute';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useUser();

  const handlePaymentClick = () => {
    router.push('/payment');
  };

  const handleLogout = () => {
    logout();
    // Small delay to prevent race condition
    setTimeout(() => {
      router.push('/login');
    }, 100);
  };

  return (
    <ProtectedRoute>
    <div>
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🌿</div>
            mediCure
          </div>
          <nav className="nav-links">
            <a href="#">Home</a>
            <a href="#">About Us</a>
            <a href="#">Contact Us</a>
          </nav>
          <div className="user-section">
            <span className="welcome-text">
              Welcome, {user?.firstName || user?.userName || 'User'}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              👤 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">
          🏥 Welcome to mediCure Portal
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
          Your comprehensive healthcare management platform. Access your medical records, 
          schedule appointments, and manage payments all in one place.
        </p>

        {/* Quick Actions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Payment Card */}
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handlePaymentClick}>
            <div style={{ 
              margin: '0 auto 1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '4rem',
              width: '4rem',
              borderRadius: '50%',
              backgroundColor: '#E8F5E9'
            }}>
              <span style={{ fontSize: '2rem' }}>💳</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#424242', marginBottom: '0.5rem' }}>
              Make Payment
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Pay for your healthcare services using credit card, insurance coverage, or cash deposit.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Pay Now
            </button>
          </div>

          {/* Appointments Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ 
              margin: '0 auto 1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '4rem',
              width: '4rem',
              borderRadius: '50%',
              backgroundColor: '#E3F2FD'
            }}>
              <span style={{ fontSize: '2rem' }}>📅</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#424242', marginBottom: '0.5rem' }}>
              Book Appointment
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Schedule your next medical appointment with our qualified healthcare providers.
            </p>
            <button className="btn" style={{ backgroundColor: '#2196F3', color: 'white', width: '100%' }}>
              Book Now
            </button>
          </div>

          {/* Medical Records Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ 
              margin: '0 auto 1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '4rem',
              width: '4rem',
              borderRadius: '50%',
              backgroundColor: '#F3E5F5'
            }}>
              <span style={{ fontSize: '2rem' }}>📋</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#424242', marginBottom: '0.5rem' }}>
              Medical Records
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              View your medical history, test results, and prescription records.
            </p>
            <button className="btn" style={{ backgroundColor: '#9C27B0', color: 'white', width: '100%' }}>
              View Records
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="card-title">
            📊 Recent Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1rem', 
              backgroundColor: '#F5F5F5', 
              borderRadius: '8px',
              gap: '1rem'
            }}>
              <div style={{ 
                flexShrink: 0,
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: '#E8F5E9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#66BB6A' }}>✅</span>
              </div>
              <div>
                <p style={{ fontWeight: '500', color: '#424242' }}>Payment Successful</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>$55.00 - Healthcare Services</p>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>2 hours ago</p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1rem', 
              backgroundColor: '#F5F5F5', 
              borderRadius: '8px',
              gap: '1rem'
            }}>
              <div style={{ 
                flexShrink: 0,
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: '#E3F2FD',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#2196F3' }}>📅</span>
              </div>
              <div>
                <p style={{ fontWeight: '500', color: '#424242' }}>Appointment Scheduled</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Dr. Sarah Johnson - Primary Care</p>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <p>© 2023 mediCure Portal. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default HomePage;