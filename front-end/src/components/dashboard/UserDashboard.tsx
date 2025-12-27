import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContainer } from '../../hooks/useContainer';
import ContainerStatus from './ContainerStatus';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const UserDashboard: React.FC = () => {
  const { container, loading, createContainer, deleteContainer } = useContainer();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {container ? (
        <Card title="Active Container">
          <ContainerStatus container={container} />
          
          <div className="flex gap-4 mt-6">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/terminal')}
            >
              Open Terminal
            </Button>
            
            <Button
              variant="danger"
              fullWidth
              onClick={deleteContainer}
            >
              Delete Container
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              No Active Container
            </h2>
            <p className="text-gray-400 mb-6">
              Create a new Ubuntu container to get started. It will be available for 30 minutes.
            </p>
            <Button
              variant="primary"
              onClick={createContainer}
              className="px-8"
            >
              Create Container
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;