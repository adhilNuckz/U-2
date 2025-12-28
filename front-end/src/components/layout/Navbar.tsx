import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Ubuntu SaaS' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar-root">
      <div className="navbar-container">
        <h1 
          className="navbar-title"
          onClick={() => navigate('/dashboard')}
        >
          {title}
        </h1>
        <div className="navbar-actions">
          <span className="navbar-user-email">{user?.email}</span>
          {user?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="navbar-admin-btn"
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="navbar-dashboard-btn"
          >
            Dashboard
          </button>
          <button
            onClick={logout}
            className="navbar-logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;