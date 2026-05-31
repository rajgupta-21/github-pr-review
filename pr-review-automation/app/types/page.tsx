export interface User {
  _id: string;
  email: string | null;
  role: string;
  githubConnected: boolean;
  githubId?: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  plan: string;
}

export interface UserResponse {
  authenticated: boolean;
  user: User;
}