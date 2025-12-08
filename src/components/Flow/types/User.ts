export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}