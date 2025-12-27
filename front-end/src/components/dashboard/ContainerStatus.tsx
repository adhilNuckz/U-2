import React, { useState, useEffect } from 'react';

interface ContainerStatusProps {
  container: any;
}

const ContainerStatus: React.FC<ContainerStatusProps> = ({ container }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (container?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(container.expiresAt).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeRemaining('Expired');
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [container]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-gray-300">
        <span className="font-medium">Container ID:</span>
        <span className="font-mono text-sm bg-gray-700 px-3 py-1 rounded">
          {container.containerId?.substring(0, 12)}
        </span>
      </div>
      
      <div className="flex justify-between items-center text-gray-300">
        <span className="font-medium">Time Remaining:</span>
        <span
          className={`font-bold text-lg ${
            timeRemaining === 'Expired'
              ? 'text-red-500'
              : parseInt(timeRemaining.split(':')[0]) < 5
              ? 'text-yellow-500'
              : 'text-green-500'
          }`}
        >
          {timeRemaining}
        </span>
      </div>

      <div className="flex justify-between items-center text-gray-300">
        <span className="font-medium">Status:</span>
        <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
          Running
        </span>
      </div>
    </div>
  );
};

export default ContainerStatus;