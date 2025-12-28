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
    <div className="containerstatus-root">
      <div className="containerstatus-row">
        <span className="containerstatus-label">Container ID:</span>
        <span className="containerstatus-id">
          {container.containerId?.substring(0, 12)}
        </span>
      </div>
      <div className="containerstatus-row">
        <span className="containerstatus-label">Time Remaining:</span>
        <span
          className={`containerstatus-time ${
            timeRemaining === 'Expired'
              ? 'containerstatus-expired'
              : parseInt(timeRemaining.split(':')[0]) < 5
              ? 'containerstatus-warning'
              : 'containerstatus-active'
          }`}
        >
          {timeRemaining}
        </span>
      </div>
      <div className="containerstatus-row">
        <span className="containerstatus-label">Status:</span>
        <span className="containerstatus-status">Running</span>
      </div>
    </div>
  );
};

export default ContainerStatus;