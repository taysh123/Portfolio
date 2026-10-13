import { Site } from "@/components/Site";
import { pageMetadata } from "@/lib/meta";

/** The Hebrew page: the same site at a stable address of its own (lib/i18n.ts). */
export const metadata = pageMetadata("he");

export default function Page() {
  return <Site locale="he" />;
}
