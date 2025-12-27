import React from 'react';
import Card from '../common/Card';

interface SystemHealthProps {
  health: any;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ health }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-white">
          {health?.totalUsers || 0}
        </p>
      </Card>
      
      <Card>
        <h3 className="text-gray-400 text-sm mb-2">Active Containers</h3>
        <p className="text-3xl font-bold text-green-500">
          {health?.activeContainers || 0}
        </p>
      </Card>
      
      <Card>
        <h3 className="text-gray-400 text-sm mb-2">Max Capacity</h3>
        <p className="text-3xl font-bold text-blue-500">10</p>
        <p className="text-sm text-gray-400 mt-1">
          Usage: {((health?.activeContainers / 10) * 100 || 0).toFixed(0)}%
        </p>
      </Card>
    </div>
  );
};

export default SystemHealth;