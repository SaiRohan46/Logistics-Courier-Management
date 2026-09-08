import React from 'react';
import { Package, Zap, Search, LogOut, User, LayoutDashboard, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab, priorityCount, onOpenAuthModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            padding: '0.55rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Package size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Logi</span><span className="gradient-text">Pulse</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Dispatch & Priority Engine
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`btn ${activeTab === 'priority' ? 'btn-priority' : 'btn-secondary'}`}
            onClick={() => setActiveTab('priority')}
            style={{ position: 'relative' }}
          >
            <Zap size={16} />
            <span>Priority Hub</span>
            {priorityCount > 0 && (
              <span style={{
                background: '#ffffff',
                color: '#f43f5e',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                marginLeft: '0.2rem'
              }}>
                {priorityCount}
              </span>
            )}
          </button>

          <button
            className={`btn ${activeTab === 'track' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('track')}
          >
            <Compass size={16} />
            <span>Track Waybill</span>
          </button>
        </nav>

        {/* User / Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--primary)', textTransform: 'capitalize', fontWeight: 600 }}>{user.role}</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Logout"
                style={{ padding: '0.5rem' }}
              >
                <LogOut size={16} color="#f87171" />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuthModal}>
              <User size={16} />
              <span>Login / Signup</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
