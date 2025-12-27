import { useState, useEffect } from 'react';
import { containerService } from '../services/container.service';
import toast from 'react-hot-toast';

export const useContainer = () => {
  const [container, setContainer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContainer = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await containerService.getUserContainer();
      setContainer(data);
    } catch (err: any) {
      setError(err.message);
      setContainer(null);
    } finally {
      setLoading(false);
    }
  };

  const createContainer = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await containerService.createContainer();
      setContainer(data);
      toast.success('Container created successfully!');
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create container';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContainer = async () => {
    setLoading(true);
    setError(null);
    try {
      await containerService.deleteContainer();
      setContainer(null);
      toast.success('Container deleted successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete container';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainer();
  }, []);

  return {
    container,
    loading,
    error,
    createContainer,
    deleteContainer,
    refetch: fetchContainer,
  };
};