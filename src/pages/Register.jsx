import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import '../styling/Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to register. Username or email may already exist.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Instagram</h1>
        <p className="auth-subtitle">
          Sign up to see photos and videos from your friends.
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Mobile number or email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-input"
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-input"
          />
          
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="auth-input"
          />
          
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="auth-input"
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <p className="auth-terms">
            People who use our service may have uploaded your contact information to Instagram.{' '}
            <a href="#" className="auth-terms-link">Learn more</a>
          </p>
          
          <p className="auth-terms">
            By signing up, you agree to our{' '}
            <a href="#" className="auth-terms-link">Terms</a>,{' '}
            <a href="#" className="auth-terms-link">Privacy Policy</a> and{' '}
            <a href="#" className="auth-terms-link">Cookies Policy</a>.
          </p>
          
          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
      
      <div className="auth-card auth-signup">
        <p>
          Have an account?{' '}
          <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
      
      <div className="auth-footer">
        <p>Get the app.</p>
        <div className="auth-app-buttons">
          <a href="#" className="app-button">
            <img src="https://www.instagram.com/static/images/appstore-install-badges/badge_android_english-en.png/e9cd846dc748.png" alt="Get it on Google Play" />
          </a>
          <a href="#" className="app-button">
            <img src="https://www.instagram.com/static/images/appstore-install-badges/badge_ios_english-en.png/180ae7a0bcf7.png" alt="Get it from Microsoft" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;

