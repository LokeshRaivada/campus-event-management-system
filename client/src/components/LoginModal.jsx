import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Shield, Crown, ArrowLeft, Mail, Loader2, KeyRound, RefreshCw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const API_URL = 'https://event-backend-api-syye.onrender.com/api';

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Access your events and registrations',
    icon: User,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Manage events and approvals',
    icon: Shield,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  },
  {
    id: 'super_admin',
    title: 'Super Admin',
    description: 'Full system administration',
    icon: Crown,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
];

export default function LoginModal({ isOpen, onClose }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedRole(null);
        setEmail('');
        setPassword('');
        setError('');
        setEmailError('');
        setEmailTouched(false);
      }, 300);
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (emailTouched) {
      if (!value) setEmailError('Email is required');
      else if (!validateEmail(value)) setEmailError('Please enter a valid email');
      else setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!email) setEmailError('Email is required');
    else if (!validateEmail(email)) setEmailError('Please enter a valid email');
    else setEmailError('');
  };

  // ── Handle Login ────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await res.json();

      if (data.success) {
        auth.login(data.user, data.token);
        setError('');
        setIsLoading(false);
        onClose();

        // Use the role mapping from database which matches constants/roles.js
        const redirectPath = auth.getRoleRedirect(selectedRole);
        navigate(redirectPath);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Server error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentRole = roles.find(r => r.id === selectedRole);

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleBackdropClick}>
      <div className={`login-modal ${selectedRole ? 'has-role' : ''}`} ref={modalRef}>
        <button className="login-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* ── Role Selection Screen ─────────────────────────────── */}
        <div className={`login-modal-content ${selectedRole ? 'slide-left' : ''}`}>
          <div className="login-modal-header">
            <div className="login-modal-logo">
              <div className="logo-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <span className="logo-text">GMRIT<span>Events</span></span>
            </div>
            <h2>Welcome Back</h2>
            <p>Select your role to continue</p>
          </div>

          <div className="role-selection">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  className="role-card"
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    '--role-color': role.color,
                    '--role-gradient': role.gradient,
                    '--delay': `${index * 0.1}s`
                  }}
                >
                  <div className="role-icon">
                    <Icon size={28} />
                  </div>
                  <div className="role-info">
                    <h3>{role.title}</h3>
                    <p>{role.description}</p>
                  </div>
                  <div className="role-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Login Form ───────────────────────────────────────── */}
        <div className={`login-form-container ${selectedRole ? 'visible' : ''}`}>
          <button className="back-button" onClick={() => {
            setSelectedRole(null);
            setError('');
            setEmail('');
            setPassword('');
            setEmailError('');
            setEmailTouched(false);
          }}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          {currentRole && (
            <div className="form-header" style={{ '--role-color': currentRole.color, '--role-gradient': currentRole.gradient }}>
              <div className="form-role-badge">
                <currentRole.icon size={20} />
                <span>{currentRole.title} Login</span>
              </div>
              <h2>Login</h2>
              <p>Enter your credentials to access your dashboard</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className={`form-group ${emailError && emailTouched ? 'has-error' : ''} ${email && !emailError ? 'valid' : ''}`}>
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                  required
                />
                {email && !emailError && (
                  <div className="valid-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
              {emailError && emailTouched && <span className="error-message">{emailError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <KeyRound size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="error-message centered-error" style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
              style={{ '--role-gradient': currentRole?.gradient }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
