import { useState } from 'react';
import { ApiClient } from '../api/ApiClient';
import type { User } from '../components/Flow/types/User';
import { useNavigate } from 'react-router-dom';

const api = new ApiClient(import.meta.env.VITE_API_URL, () => localStorage.getItem('token'));

export function useUsers() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const data = await api.post<{ token: string; user: User }>('/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };



  return { user, error, login, logout };
}