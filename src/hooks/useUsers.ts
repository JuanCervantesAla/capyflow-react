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
      const data = await api.post<{ token: string; user: User }>('/api/login', { email, password });
      localStorage.setItem('token', data.token);
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

  // REGISTER
  const register = async (name: string, email: string, password: string) => {
    setError(null);

    try {
      const response = await api.post<{ message: string }>('/api/register', {
        name,
        email,
        password,
      });

      return response; // no guardamos token, ni user (tu backend no los envía)
    } catch (err: any) {
      setError(err.message);
      throw err; // para que el componente pueda manejarlo también
    }
  };

  //TODO: ADD ALL USER METHODS, GET USER, ETC...

  return { user, error, login, register, logout };
}