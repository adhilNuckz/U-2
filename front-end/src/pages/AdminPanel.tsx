import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [healthData, usersData] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getAllUsers(),
      ]);
      setHealth(healthData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContainer = async (containerId: string) => {
    if (!confirm('Are you sure you want to delete this container?')) return;
    
    try {
      await adminService.forceDeleteContainer(containerId);
      toast.success('Container deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete container');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This will delete all their containers.')) return;
    
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <div className="flex items-center gap-4">
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

      <div className="container mx-auto px-4 py-8">
        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">{health?.totalUsers || 0}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Active Containers</h3>
            <p className="text-3xl font-bold text-green-500">{health?.activeContainers || 0}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Max Capacity</h3>
            <p className="text-3xl font-bold text-blue-500">10</p>
          </div>
        </div>

        {/* Active Containers */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Active Containers</h2>
          
          {health?.containers?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-gray-400">Container</th>
                    <th className="py-3 px-4 text-gray-400">User</th>
                    <th className="py-3 px-4 text-gray-400">CPU %</th>
                    <th className="py-3 px-4 text-gray-400">Memory</th>
                    <th className="py-3 px-4 text-gray-400">Expires</th>
                    <th className="py-3 px-4 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {health.containers.map((container: any) => (
                    <tr key={container.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-3 px-4 text-white font-mono text-sm">
                        {container.containerName}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{container.userEmail}</td>
                      <td className="py-3 px-4 text-gray-300">{container.cpuPercent}%</td>
                      <td className="py-3 px-4 text-gray-300">
                        {container.memoryUsageMB}/{container.memoryLimitMB} MB
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(container.expiresAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteContainer(container.containerName)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No active containers</p>
          )}
        </div>

        {/* Users List */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Users</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-400">ID</th>
                  <th className="py-3 px-4 text-gray-400">Email</th>
                  <th className="py-3 px-4 text-gray-400">Role</th>
                  <th className="py-3 px-4 text-gray-400">Active</th>
                  <th className="py-3 px-4 text-gray-400">Total</th>
                  <th className="py-3 px-4 text-gray-400">Joined</th>
                  <th className="py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 text-white">{u.id}</td>
                    <td className="py-3 px-4 text-gray-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${u.isAdmin ? 'bg-purple-600' : 'bg-gray-600'} text-white`}>
                        {u.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{u.activeContainers}</td>
                    <td className="py-3 px-4 text-gray-300">{u.totalContainers}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {!u.isAdmin && u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;