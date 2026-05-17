/**
 * Provider IDs used across the app (both client and server).
 */
export const VERCEL_PROVIDER_ID = "vercel" as const;
export const CLOUDFLARE_PAGES_PROVIDER_ID = "cloudflare-pages" as const;
export const GITHUB_REPO_PROVIDER_ID = "github-repo" as const;

export type DeployProviderId =
  | typeof VERCEL_PROVIDER_ID
  | typeof CLOUDFLARE_PAGES_PROVIDER_ID
  | typeof GITHUB_REPO_PROVIDER_ID;

export function isDeployProviderId(value: unknown): value is DeployProviderId {
  return (
    value === VERCEL_PROVIDER_ID ||
    value === CLOUDFLARE_PAGES_PROVIDER_ID ||
    value === GITHUB_REPO_PROVIDER_ID
  );
}
