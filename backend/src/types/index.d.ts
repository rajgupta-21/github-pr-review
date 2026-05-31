import { JwtPayload } from "jsonwebtoken";

interface AuthUser {
  id: string;
  email: string;
  githubUsername?: string;
  githubAccessToken?: string;
  githubId: string;
  avatarUrl?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | AuthUser;
    }
  }
}

export {};
