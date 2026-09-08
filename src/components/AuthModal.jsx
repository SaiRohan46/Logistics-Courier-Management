import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, showToast }) => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'dispatcher'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await signup(formData.name, formData.email, formData.password, formData.role);
        showToast('Account registered successfully! Welcome to LogiPulse.', 'success');
      } else {
        await login(formData.email, formData.password);
        showToast('Login successful!', 'success');
      }
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="var(--primary)" />
            <span>{isSignup ? 'Create Account' : 'Portal Login'}</span>
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem', background: !isSignup ? 'var(--primary)' : 'transparent', color: '#fff' }}
            onClick={() => setIsSignup(false)}
          >
            Login
          </button>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem', background: isSignup ? 'var(--primary)' : 'transparent', color: '#fff' }}
            onClick={() => setIsSignup(true)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {isSignup && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="search-box">
                <User size={16} className="search-icon" />
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Marcus Vance"
                  required={isSignup}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="search-box">
              <Mail size={16} className="search-icon" />
              <input
                type="email"
                name="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                placeholder="dispatcher@logipulse.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="search-box">
              <Lock size={16} className="search-icon" />
              <input
                type="password"
                name="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {isSignup && (
            <div className="input-group">
              <label className="input-label">Account Role</label>
              <select name="role" className="select-field" value={formData.role} onChange={handleChange}>
                <option value="dispatcher">Dispatcher / Courier Operations</option>
                <option value="admin">System Administrator</option>
                <option value="customer">Customer / Recipient</option>
              </select>
            </div>
          )}

          {/* Quick Demo Credentials helper */}
          {!isSignup && (
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Demo Credentials:</strong><br />
              • Admin: <code>admin@logipulse.com</code> / <code>admin123</code><br />
              • Dispatcher: <code>dispatcher@logipulse.com</code> / <code>dispatch123</code>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isSignup ? 'Register Account' : 'Sign In')}
          </button>

        </form>

      </div>
    </div>
  );
};

export default AuthModal;
