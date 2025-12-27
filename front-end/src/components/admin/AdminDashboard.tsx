import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import ContainersList from './ContainersList';
import SystemHealth from './SystemHealth';
import LoadingSpinner from '../common/LoadingSpinner';
import UsersList from './UsersList';


const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SystemHealth health={health} />
      <ContainersList containers={health?.containers || []} onRefresh={fetchData} />
      <UsersList users={users} onRefresh={fetchData} />
    </div>
  );
};

export default AdminDashboard;