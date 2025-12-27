import React from 'react';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';

interface UsersListProps {
  users: any[];
  onRefresh: () => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, onRefresh }) => {
  const { user: currentUser } = useAuth();

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This will delete all their containers.')) return;
    
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <Card title="Users">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4 text-gray-400 font-semibold">ID</th>
              <th className="py-3 px-4 text-gray-400 font-semibold">Email</th>
              <th className="py-3 px-4 text-gray-400 font-semibold">Role</th>
              <th className="py-3 px-4 text-gray-400 font-semibold">Active</th>
              <th className="py-3 px-4 text-gray-400 font-semibold">TotalContinue3:14 AM</th>
              <th className="py-3 px-4 text-gray-400 font-semibold">Joined</th>
              <th className="py-3 px-4 text-gray-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr 
                key={u.id} 
                className="border-b border-gray-700 hover:bg-gray-750"
              >
                <td className="py-3 px-4 text-white">{u.id}</td>
                <td className="py-3 px-4 text-gray-300">{u.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      u.isAdmin ? 'bg-purple-600' : 'bg-gray-600'
                    } text-white`}
                  >
                    {u.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {u.activeContainers}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {u.totalContainers}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  {!u.isAdmin && u.id !== currentUser?.id && (
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(u.id)}
                      className="text-sm py-1 px-3"
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
export default UsersList;