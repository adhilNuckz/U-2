import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Ubuntu SaaS' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 
          className="text-2xl font-bold text-white cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          {title}
        </h1>
        
        <div className="flex items-center gap-4">
          <span className="text-gray-300 hidden md:block">{user?.email}</span>
          
          {user?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
            >
              Admin Panel
            </button>
          )}
          
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
          >
            Dashboard
          </button>
          
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;