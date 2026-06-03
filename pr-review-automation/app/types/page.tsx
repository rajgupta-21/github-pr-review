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

export type RepoDetails = {
  _id: string;
  userId: string;

  repoId: number;
  name: string;

  language: string | null;
  description: string | null;
  repoUrl: string;

  owner: string;
  fullName: string;

  webhookActive: boolean;
  visibility: "public" | "private";

  defaultBranch: string;

  connected: boolean;

  createdAt: string;
  updatedAt: string;

  __v: number;
};

export type RepoDetailsResponse = {
  message: string;
  action: string;
  fetchData: RepoDetails;
};
