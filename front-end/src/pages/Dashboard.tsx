import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { containerService } from '../services/container.service';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const [container, setContainer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchContainer();
  }, []);

  useEffect(() => {
    if (container?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(container.expiresAt).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeRemaining('Expired');
          clearInterval(interval);
          fetchContainer();
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [container]);

  const fetchContainer = async () => {
    try {
      const data = await containerService.getUserContainer();
      setContainer(data);
    } catch (error) {
      setContainer(null);
    }
  };

  const createContainer = async () => {
    setLoading(true);
    try {
      const data = await containerService.createContainer();
      setContainer(data);
      toast.success('Container created successfully!');
      navigate('/terminal');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create container');
    } finally {
      setLoading(false);
    }
  };

  const deleteContainer = async () => {
    setLoading(true);
    try {
      await containerService.deleteContainer();
      setContainer(null);
      toast.success('Container deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete container');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-bg">
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-container">
          <h1 className="dashboard-title">Ubuntu SaaS</h1>
          <div className="dashboard-user-actions">
            <span className="dashboard-user-email">{user?.email}</span>
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="dashboard-admin-btn"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={logout}
              className="dashboard-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-content-inner">
          {container ? (
            <div className="dashboard-card">
              <h2 className="dashboard-card-title">
                Active Container
              </h2>
              <div className="dashboard-status-list">
                <div className="dashboard-status-row">
                  <span>Container ID:</span>
                  <span className="dashboard-status-id">
                    {container.containerId?.substring(0, 12)}
                  </span>
                </div>
                <div className="dashboard-status-row">
                  <span>Time Remaining:</span>
                  <span
                    className={`dashboard-status-time ${
                      timeRemaining === 'Expired'
                        ? 'dashboard-status-expired'
                        : 'dashboard-status-active'
                    }`}
                  >
                    {timeRemaining}
                  </span>
                </div>
              </div>
              <div className="dashboard-actions">
                <button
                  onClick={() => navigate('/terminal')}
                  className="dashboard-terminal-btn"
                >
                  Open Terminal
                </button>
                <button
                  onClick={deleteContainer}
                  disabled={loading}
                  className="dashboard-delete-btn"
                >
                  {loading ? 'Deleting...' : 'Delete Container'}
                </button>
              </div>
            </div>
          ) : (
            <div className="dashboard-card dashboard-card-empty">
              <h2 className="dashboard-card-title">
                No Active Container
              </h2>
              <p className="dashboard-card-desc">
                Create a new Ubuntu container to get started. It will be available for 30 minutes.
              </p>
              <button
                onClick={createContainer}
                disabled={loading}
                className="dashboard-create-btn"
              >
                {loading ? 'Creating...' : 'Create Container'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;