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
      <div className="adminpanel-bg adminpanel-center">
        <div className="adminpanel-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="adminpanel-bg">
      <nav className="adminpanel-navbar">
        <div className="adminpanel-navbar-container">
          <h1 className="adminpanel-title">Admin Panel</h1>
          <div className="adminpanel-actions">
            <button
              onClick={() => navigate('/dashboard')}
              className="adminpanel-dashboard-btn"
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              className="adminpanel-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="adminpanel-content">
        {/* System Health */}
        <div className="adminpanel-health-grid">
          <div className="adminpanel-health-card">
            <h3 className="adminpanel-health-label">Total Users</h3>
            <p className="adminpanel-health-value">{health?.totalUsers || 0}</p>
          </div>
          <div className="adminpanel-health-card">
            <h3 className="adminpanel-health-label">Active Containers</h3>
            <p className="adminpanel-health-value adminpanel-health-green">{health?.activeContainers || 0}</p>
          </div>
          <div className="adminpanel-health-card">
            <h3 className="adminpanel-health-label">Max Capacity</h3>
            <p className="adminpanel-health-value adminpanel-health-blue">10</p>
          </div>
        </div>

        {/* Active Containers */}
        <div className="adminpanel-table-card">
          <h2 className="adminpanel-table-title">Active Containers</h2>
          {health?.containers?.length > 0 ? (
            <div className="adminpanel-table-scroll">
              <table className="adminpanel-table">
                <thead>
                  <tr className="adminpanel-table-header-row">
                    <th className="adminpanel-table-header">Container</th>
                    <th className="adminpanel-table-header">User</th>
                    <th className="adminpanel-table-header">CPU %</th>
                    <th className="adminpanel-table-header">Memory</th>
                    <th className="adminpanel-table-header">Expires</th>
                    <th className="adminpanel-table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {health.containers.map((container: any) => (
                    <tr key={container.id} className="adminpanel-table-row">
                      <td className="adminpanel-table-cell adminpanel-table-id">{container.containerName}</td>
                      <td className="adminpanel-table-cell">{container.userEmail}</td>
                      <td className="adminpanel-table-cell">{container.cpuPercent}%</td>
                      <td className="adminpanel-table-cell">{container.memoryUsageMB}/{container.memoryLimitMB} MB</td>
                      <td className="adminpanel-table-cell">{new Date(container.expiresAt).toLocaleTimeString()}</td>
                      <td className="adminpanel-table-cell">
                        <button
                          onClick={() => handleDeleteContainer(container.containerName)}
                          className="adminpanel-delete-btn"
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
            <p className="adminpanel-table-empty">No active containers</p>
          )}
        </div>

        {/* Users List */}
        <div className="adminpanel-table-card">
          <h2 className="adminpanel-table-title">Users</h2>
          <div className="adminpanel-table-scroll">
            <table className="adminpanel-table">
              <thead>
                <tr className="adminpanel-table-header-row">
                  <th className="adminpanel-table-header">ID</th>
                  <th className="adminpanel-table-header">Email</th>
                  <th className="adminpanel-table-header">Role</th>
                  <th className="adminpanel-table-header">Active</th>
                  <th className="adminpanel-table-header">Total</th>
                  <th className="adminpanel-table-header">Joined</th>
                  <th className="adminpanel-table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="adminpanel-table-row">
                    <td className="adminpanel-table-cell adminpanel-table-id">{u.id}</td>
                    <td className="adminpanel-table-cell">{u.email}</td>
                    <td className="adminpanel-table-cell">
                      <span className={`adminpanel-role-badge ${u.isAdmin ? 'adminpanel-role-admin' : 'adminpanel-role-user'}`}>{u.isAdmin ? 'Admin' : 'User'}</span>
                    </td>
                    <td className="adminpanel-table-cell">{u.activeContainers}</td>
                    <td className="adminpanel-table-cell">{u.totalContainers}</td>
                    <td className="adminpanel-table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="adminpanel-table-cell">
                      {!u.isAdmin && u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="adminpanel-delete-btn"
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