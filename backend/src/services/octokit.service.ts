// github.ts

import { Octokit } from "@octokit/rest";

export function getOctokit(accessToken: string | string[]) {
  return new Octokit({
    auth: accessToken,
  });
}
