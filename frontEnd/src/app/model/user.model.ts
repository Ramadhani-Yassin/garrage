export interface User {
  id?: number;
  fullName: string;
  email: string;
  region?: string;
  password?: string;
  role?: string;
  status?: string;
  joinDate?: string | Date;
} 