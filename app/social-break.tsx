import React, { useState, useEffect } from 'react';

const SocialBreakPage: React.FC = () => {
  const [timeElapsed, setTimeElapsed] = useState<string>('');

  useEffect(() => {
    const startDate = new Date('2024-10-23T00:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeElapsed(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      backgroundColor: '#f0f8ff', 
      borderRadius: '10px', 
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '40px auto'
    }}>
      <h1 style={{ color: '#333', fontSize: '2.5em', marginBottom: '20px' }}>Social Media Break</h1>
      <p style={{ color: '#555', fontSize: '1.2em', marginBottom: '10px' }}>I don&apos;t use any social networks and have been on a break since October 23, 2024.</p>
      <p style={{ color: '#007acc', fontSize: '1.5em', fontWeight: 'bold' }}>Time since break: {timeElapsed}</p>
    </div>
  );
};

export default SocialBreakPage;
