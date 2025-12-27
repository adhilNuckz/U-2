import React from 'react';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';

interface ContainersListProps {
  containers: any[];
  onRefresh: () => void;
}

const ContainersList: React.FC<ContainersListProps> = ({ containers, onRefresh }) => {
  const handleDelete = async (containerId: string) => {
    if (!confirm('Are you sure you want to delete this container?')) return;
    
    try {
      await adminService.forceDeleteContainer(containerId);
      toast.success('Container deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete container');
    }
  };

  return (
    <Card title="Active Containers">
      {containers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-semibold">Container</th>
                <th className="py-3 px-4 text-gray-400 font-semibold">User</th>
                <th className="py-3 px-4 text-gray-400 font-semibold">CPU %</th>
                <th className="py-3 px-4 text-gray-400 font-semibold">Memory</th>
                <th className="py-3 px-4 text-gray-400 font-semibold">Expires</th>
                <th className="py-3 px-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container: any) => (
                <tr 
                  key={container.id} 
                  className="border-b border-gray-700 hover:bg-gray-750"
                >
                  <td className="py-3 px-4 text-white font-mono text-sm">
                    {container.containerName}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {container.userEmail}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {container.cpuPercent}%
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {container.memoryUsageMB}/{container.memoryLimitMB} MB
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(container.expiresAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(container.containerName)}
                      className="text-sm py-1 px-3"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No active containers</p>
      )}
    </Card>
  );
};

export default ContainersList;