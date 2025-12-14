import React from 'react';
import { useNavigate } from 'react-router-dom';
import TechDashboard from '../components/TechDashboard';

const DashboardPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate('/');
  };

  return <TechDashboard onClose={handleClose} />;
};

export default DashboardPageWrapper;