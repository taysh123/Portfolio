/**
 * Internal metadata: the source repositories of projects whose code is private.
 *
 * Kept out of `data/projects.ts` on purpose — that module is bundled into
 * client components, and a private repository's address must not ship to
 * visitors. Nothing under app/ or components/ may import this file
 * (tests/unit/private-repo.test.ts enforces it).
 */
export const INTERNAL_REPO_URLS: Record<string, string> = {
  poker: "https://github.com/taysh123/poker-home-games",
};
