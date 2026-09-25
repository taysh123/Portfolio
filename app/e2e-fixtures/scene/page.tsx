// Test fixture for ScrollScene (Plan 2 Task 5). 404s unless the server runs with E2E_FIXTURES=1.
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ScrollScene } from "@/components/scenes/ScrollScene";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page() {
  await connection();                          // request-time: read the env of the running server, not the build
  if (process.env.E2E_FIXTURES !== "1") notFound();
  return (
    <main>
      <div style={{ height: "100svh" }} />
      <ScrollScene id="fx" labelledBy="fx-t"><h2 id="fx-t">Fixture</h2><div data-probe style={{ transform: "translateY(calc((1 - var(--assemble)) * 100px))" }}>probe</div></ScrollScene>
      <div style={{ height: "100svh" }} />
    </main>
  );
}
