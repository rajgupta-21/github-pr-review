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

export interface PullRequest {
  id: number;
  number: number;

  title: string;
  state: "open" | "closed";

  html_url: string;

  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;

  user: {
    login: string;
    avatar_url: string;
  };

  head: {
    ref: string;
  };

  base: {
    ref: string;
  };
}
