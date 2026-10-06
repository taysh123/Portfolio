import { siteMeta, socials } from "@/data/socials";
import { projects, publicRepoUrl } from "@/data/projects";
import { skillGroups } from "@/data/skills";

/**
 * Structured data as one linked `@graph` rather than two orphan objects.
 *
 * Fixes a real schema error: `alumniOf` previously carried
 * `name: "Computer Science — B.Sc."`, which told Google that Tay attended a
 * university literally called "Computer Science — B.Sc." A degree belongs in
 * `hasCredential`; `alumniOf` takes an institution. Since the institution
 * isn't published anywhere on the site, the credential is emitted on its own
 * rather than inventing one.
 *
 * `knowsAbout` and the project list are derived from `data/` so they can't
 * drift from what the page actually shows.
 */
export function JsonLd() {
  const personId = `${siteMeta.url}/#person`;
  const pageId = `${siteMeta.url}/#page`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": pageId,
        url: siteMeta.url,
        name: `${siteMeta.name} — ${siteMeta.role}`,
        inLanguage: "en",
        mainEntity: { "@id": personId },
        about: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: siteMeta.name,
        url: siteMeta.url,
        jobTitle: siteMeta.role,
        description: siteMeta.tagline,
        email: socials.email,
        image: `${siteMeta.url}/opengraph-image`,
        sameAs: [socials.github.url, socials.linkedin.url],
        address: {
          "@type": "PostalAddress",
          addressCountry: "IL",
        },
        hasCredential: {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "degree",
          educationalLevel: "Bachelor",
          about: { "@type": "Thing", name: "Computer Science" },
        },
        knowsAbout: skillGroups.flatMap((g) => g.items.map((i) => i.label)),
        subjectOf: projects.map((p) => ({
          "@type": "SoftwareSourceCode",
          name: p.name,
          description: p.summary,
          ...(publicRepoUrl(p) ? { codeRepository: publicRepoUrl(p) } : {}),
          programmingLanguage: p.stack.map((s) => s.label),
          ...(p.liveUrl ? { url: p.liveUrl } : {}),
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
