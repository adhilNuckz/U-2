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
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Ubuntu SaaS</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user?.email}</span>
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {container ? (
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                Active Container
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Container ID:</span>
                  <span className="font-mono text-sm">
                    {container.containerId?.substring(0, 12)}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-300">
                  <span>Time Remaining:</span>
                  <span
                    className={`font-bold ${
                      timeRemaining === 'Expired'
                        ? 'text-red-500'
                        : 'text-green-500'
                    }`}
                  >
                    {timeRemaining}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/terminal')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  Open Terminal
                </button>
                
                <button
                  onClick={deleteContainer}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Container'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                No Active Container
              </h2>
              <p className="text-gray-400 mb-6">
                Create a new Ubuntu container to get started. It will be available for 30 minutes.
              </p>
              <button
                onClick={createContainer}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 disabled:opacity-50"
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