
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
  const {  logout } = useAuth();

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
          const totalSeconds = Math.floor(diff / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
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

  // Styles
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#111827',
    display: 'flex',
    flexDirection: 'column',
  };

  const loadingStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const loadingTextStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1.25rem',
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: '#1f2937',
    padding: '12px',
    borderBottom: '1px solid #374151',
  };

  const navContainerStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const navLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const containerIdStyle: React.CSSProperties = {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  };

  const separatorStyle: React.CSSProperties = {
    color: '#9ca3af',
  };

  const getTimerStyle = (): React.CSSProperties => {
    const minutes = parseInt(timeRemaining.split(':')[0]);
    return {
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: minutes < 5 ? '#ef4444' : '#10b981',
    };
  };

  const navRightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '4px 12px',
    fontSize: '0.875rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const dashboardButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#374151',
    color: 'white',
  };

  const logoutButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#dc2626',
    color: 'white',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px',
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor: '#1f2937',
    borderTop: '1px solid #374151',
    padding: '8px 16px',
  };

  const footerContentStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    color: '#9ca3af',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const footerTipStyle: React.CSSProperties = {
    color: '#6b7280',
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={loadingTextStyle}>Loading terminal...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Minimal Header */}
      <nav style={navStyle}>
        <div style={navContainerStyle}>
          <div style={navLeftStyle}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            >
              ← Back
            </button>
            <span style={containerIdStyle}>
              Container: {container?.containerId?.substring(0, 12)}
            </span>
            <span style={separatorStyle}>•</span>
            <span style={getTimerStyle()}>
              ⏱ {timeRemaining}
            </span>
          </div>

          <div style={navRightStyle}>
            <button
              onClick={() => navigate('/dashboard')}
              style={dashboardButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              style={logoutButtonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Terminal */}
      <div style={contentStyle}>
        <Terminal containerId={container?.containerId} />
      </div>

      {/* Minimal Footer */}
      <div style={footerStyle}>
        <div style={footerContentStyle}>
          <span>💡 Tips: Use ↑↓ for history | Ctrl+C to cancel | Ctrl+L to clear</span>
          <span style={footerTipStyle}>Type commands directly in the terminal</span>
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;