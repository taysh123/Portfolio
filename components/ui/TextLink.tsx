import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowUpRightIcon } from "@/components/ui/icons";

/** A text link at button height (a 44px target): the secondary action beside a button, in the accent. External
 *  links carry the arrow and say they open a new tab. */
export function TextLink({ href, external, className, children, ...rest }: { href: string; external?: boolean; className?: string; children: ReactNode } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  return (
    <a href={href} className={cn("group/tl inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-medium text-accent underline-offset-4 hover:underline", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)} {...rest}>
      {children}
      {external && <ArrowUpRightIcon size={15} className="transition-transform duration-200 ease-[var(--ease-out)] group-hover/tl:translate-x-0.5 group-hover/tl:-translate-y-0.5" />}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
