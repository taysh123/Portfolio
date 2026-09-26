"use client";

import { useEffect, useRef, useState } from "react";
import { socials } from "@/data/socials";
import { decodePhone } from "@/lib/obfuscate";
import { ArrowUpRightIcon, PhoneIcon } from "@/components/ui/icons";

/**
 * Phone number behind a deliberate tap.
 *
 * The number ships base64-encoded (`data/socials.ts`) and is only decoded in
 * response to a user gesture, so the served HTML carries nothing a scraper can
 * lift. This is the only stateful part of the Contact section, which is why it
 * lives in its own file — `Contact` itself stays a Server Component.
 *
 * The row surface comes in as `className` so the channel-row recipe has exactly
 * one definition, in `Contact`.
 */
export function PhoneReveal({ className }: { className?: string }) {
  const [phone, setPhone] = useState<string | null>(null);
  const link = useRef<HTMLAnchorElement>(null);
  // The button is replaced by the link, so focus follows it: left alone it fell to <body> and a keyboard or
  // screen-reader user heard nothing (review #6). Focusing the link reads out the revealed number.
  useEffect(() => { if (phone) link.current?.focus({ preventScroll: true }); }, [phone]);

  const body = (
    <>
      <PhoneIcon
        size={18}
        className="shrink-0 text-fg-subtle transition-colors duration-[var(--dur-mid)] group-hover/row:text-accent"
      />
      <span className="min-w-0 flex-1">
        <span className="label block text-fg-subtle">Phone</span>
        <span className="mt-1 block truncate text-sm text-fg">
          {phone ?? "Tap to reveal"}
        </span>
      </span>
      <ArrowUpRightIcon
        size={15}
        className="shrink-0 text-fg-subtle transition-transform duration-[var(--dur-mid)] ease-[var(--ease-out-expo)] group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5"
      />
    </>
  );

  if (phone) {
    return (
      <a ref={link} href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className={className}>
        {body}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPhone(decodePhone(socials.phoneEncoded))}
      className={className}
    >
      {body}
    </button>
  );
}
