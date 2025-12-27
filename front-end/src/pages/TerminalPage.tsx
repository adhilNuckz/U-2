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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Ubuntu Terminal</h1>
          <div className="flex items-center gap-4">
            <div className="text-gray-300">
              Time: <span className={`font-bold ${parseInt(timeRemaining.split(':')[0]) < 5 ? 'text-red-500' : 'text-green-500'}`}>
                {timeRemaining}
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              Container: {container?.containerId?.substring(0, 12)}
            </h2>
            <button
              onClick={downloadOutput}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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