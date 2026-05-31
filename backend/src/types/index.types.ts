export type Repos = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  default_branch: string;
  language: string | null;
  html_url: string;
};
