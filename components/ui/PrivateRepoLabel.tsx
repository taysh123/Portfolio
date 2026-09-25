import { LockIcon } from "@/components/ui/icons";
import { PRIVATE_REPO_LABEL } from "@/data/projects";
import { cn } from "@/lib/cn";

/**
 * Stands in for a "Source" link when the repository is private: a plain,
 * non-interactive label, so visitors are told the truth instead of being sent
 * to a GitHub 404.
 */
export function PrivateRepoLabel({ className, iconSize = 15 }: { className?: string; iconSize?: number }) {
  return (
    <span
      data-private-repo
      className={cn("inline-flex items-center gap-2 text-sm text-fg-subtle", className)}
    >
      <LockIcon size={iconSize} />
      {PRIVATE_REPO_LABEL}
    </span>
  );
}
