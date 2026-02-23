import { ApiClient } from "../ApiClient";
import type { User } from "../../components/Flow/types/User";

const api = new ApiClient(
  import.meta.env.VITE_API_URL,
  () => localStorage.getItem('token')
);

export const loginRequest = (email: string, password: string) =>
  api.post<{ token: string; user: User }>('/login', { email, password });

export const registerRequest = (
  name: string,
  email: string,
  password: string
) =>
  api.post<{ message: string; token: string; user: User }>('/register', {
    name,
    email,
    password,
  });

export const getMeRequest = () =>
  api.get<User>('/me');

export const getGeminiAPIKey = () =>
  api.get<{ apiKey: string | null; hasKey: boolean }>('/user/api-key');

export const saveGeminiAPIKey = (apiKey: string) =>
  api.post<{ message: string; success: boolean }>('/user/api-key', { apiKey });

export const deleteGeminiAPIKey = () =>
  api.delete<{ message: string; success: boolean }>('/user/api-key');

