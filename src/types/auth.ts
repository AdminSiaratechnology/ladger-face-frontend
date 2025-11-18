// types/auth.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  subRole: string[];
  company: null | any;
  createdBy: null | any;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginResponse {
  statusCode: number;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string;
}