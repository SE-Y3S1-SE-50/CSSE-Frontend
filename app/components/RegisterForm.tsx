'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';

export default function RegistrationForm() {
  const router = useRouter();
  const { login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.gender) {
      setError('Please select a gender');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Username validation
    if (formData.userName.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data (exclude confirmPassword)
      const { confirmPassword, ...registrationData } = formData;

      // Patient registration endpoint
      const endpoint = 'http://localhost:3001/api/user/register/patient';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      console.log('Registration successful:', data);
      
      // Create user object from form data
      const userData = {
        id: data.id || data.userId || '',
        userName: formData.userName,
        role: 'Patient' as const,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender
      };

      // Store user in context and localStorage
      login(userData);
      
      setSuccess(true);

      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '2rem 1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', color: '#66BB6A', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#424242',
            marginBottom: '1rem'
          }}>
            Registration Successful!
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Your Patient account has been created successfully. Redirecting you to the home page...
          </p>
          <Link
            href="/home"
            className="btn btn-primary"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '2rem 1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '600px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#424242',
            marginBottom: '0.5rem'
          }}>
            Create Patient Account
          </h2>
          <p style={{ color: '#666' }}>Fill in your information to get started</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                First Name <span style={{ color: '#f44336' }}>*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Last Name <span style={{ color: '#f44336' }}>*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="userName">
              Username <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              className="form-input"
              placeholder="johndoe"
              value={formData.userName}
              onChange={handleChange}
              required
              autoComplete="username"
              minLength={3}
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Minimum 3 characters
            </small>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="phoneNumber">
              Phone Number <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="form-input"
              placeholder="+1234567890"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              autoComplete="tel"
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">
              Gender <span style={{ color: '#f44336' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                />
                Male
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                />
                Female
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={formData.gender === 'Other'}
                  onChange={handleChange}
                />
                Other
              </label>
            </div>
          </div>

          {/* Password Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span style={{ color: '#f44336' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                Minimum 6 characters
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm <span style={{ color: '#f44336' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ 
              width: '100%',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Patient Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#66BB6A', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}