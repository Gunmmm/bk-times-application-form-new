import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        const storedUser = localStorage.getItem('userData');
        const storedRole = localStorage.getItem('role');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (storedRole) {
          setUser({ email: localStorage.getItem('userEmail') || 'admin@ricotta.portal', role: storedRole });
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (args, secondArg, thirdArg) => {
    let email, password, role, details;
    if (typeof args === 'object' && !secondArg) {
      ({ email, password, role, ...details } = args);
    } else {
      email = args;
      password = secondArg;
      role = thirdArg?.role;
      details = thirdArg || {};
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, ...details }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('role', data.role); // Store role explicitly
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const currentRole = localStorage.getItem('role') || '';
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    localStorage.removeItem('role');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    // Coordinators go back to portal login; reporters go to main login
    const coordinatorRoles = ['village_coordinator', 'village', 'taluka_coordinator', 'taluka', 'district_coordinator', 'district', 'zone_coordinator', 'zone', 'admin'];
    if (coordinatorRoles.includes(currentRole)) {
      navigate('/portal-login-form');
    } else {
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
