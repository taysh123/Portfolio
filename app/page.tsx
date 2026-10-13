import { Site } from "@/components/Site";
import { pageMetadata } from "@/lib/meta";

export const metadata = pageMetadata("en");

export default function Page() {
  return <Site locale="en" />;
}
