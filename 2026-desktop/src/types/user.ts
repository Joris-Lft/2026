export interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
