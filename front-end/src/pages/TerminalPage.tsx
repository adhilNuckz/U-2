import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Terminal from '../components/terminal/Terminal';
import { containerService } from '../services/container.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TerminalPage: React.FC = () => {
  const [container, setContainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
          toast.error('Container expired!');
          navigate('/dashboard');
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [container, navigate]);

  const fetchContainer = async () => {
    try {
      const data = await containerService.getUserContainer();
      if (!data) {
        toast.error('No active container found');
        navigate('/dashboard');
        return;
      }
      setContainer(data);
    } catch (error) {
      toast.error('Failed to fetch container');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const downloadOutput = () => {
    // This would save terminal history
    toast.success('Download feature coming soon!');
  };

  if (loading) {
    return (
      <div className="terminal-bg terminal-center">
        <div className="terminal-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="terminal-bg terminal-flex-col">
      <nav className="terminal-navbar">
        <div className="terminal-navbar-container">
          <h1 className="terminal-title">Ubuntu Terminal</h1>
          <div className="terminal-actions">
            <div className="terminal-time">
              Time: <span className={`terminal-time-value ${parseInt(timeRemaining.split(':')[0]) < 5 ? 'terminal-time-expired' : 'terminal-time-active'}`}>
                {timeRemaining}
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="terminal-dashboard-btn"
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              className="terminal-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="terminal-content">
        <div className="terminal-card">
          <div className="terminal-card-header">
            <h2 className="terminal-card-title">
              Container: {container?.containerId?.substring(0, 12)}
            </h2>
            <button
              onClick={downloadOutput}
              className="terminal-download-btn"
            >
              Download Output
            </button>
          </div>
          <Terminal containerId={container?.containerId} />
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;