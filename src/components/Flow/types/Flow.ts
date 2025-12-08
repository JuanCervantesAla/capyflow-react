export interface Flow {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}