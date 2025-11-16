import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import '../styling/Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to login. Please check your credentials.';
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
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Phone number, username or email address"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="auth-input"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <div className="auth-divider-text">OR</div>
          <div className="auth-divider-line"></div>
        </div>
        
        <a href="#" className="auth-forgot">Forgotten your password?</a>
      </div>
      
      <div className="auth-card auth-signup">
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Sign up</Link>
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

export default Login;

