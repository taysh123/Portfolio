import { socials, siteMeta, availability } from "@/data/socials";
import { ButtonLink } from "@/components/ui/Button";
import { PhoneReveal } from "@/components/ui/PhoneReveal";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/ui/icons";
import "./contact.css";

/** Spec §5.6: "Let's build / something great." over the planet-horizon light; one primary action. */
export function Contact() {
  const channel = "inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line px-4 text-sm text-fg-muted hover:border-line-strong hover:text-fg";
  return (
    <section id="contact" aria-labelledby="contact-title" data-theme="dark" className="contact seam-top-dark seam-bottom-dark relative overflow-hidden bg-[var(--bg)]">
      <div className="contact__horizon" aria-hidden="true" />
      <div className="shell relative py-[clamp(8rem,18vh,14rem)] text-center">
        {availability.open && <p className="label inline-flex items-center gap-2 text-fg-muted"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--status-live)]" />{availability.label}</p>}
        <h2 id="contact-title" className="mt-6 text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
          Let&apos;s build<br /><span className="text-fg-muted">something great.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[52ch] text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>{availability.detail}</p>
        <div className="mt-10 flex justify-center"><ButtonLink href={`mailto:${socials.email}?subject=${encodeURIComponent("Hello Tay")}`} size="lg">Get in touch</ButtonLink></div>
        <address className="mt-8 flex flex-wrap justify-center gap-3 not-italic">
          <a className={channel} href={socials.github.url} target="_blank" rel="noopener noreferrer"><GithubIcon size={16} />GitHub<span className="sr-only"> (opens in a new tab)</span></a>
          <a className={channel} href={socials.linkedin.url} target="_blank" rel="noopener noreferrer"><LinkedinIcon size={16} />LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
          <a className={channel} href={`mailto:${socials.email}`}><MailIcon size={16} />Email</a>
          <PhoneReveal className={channel} />
        </address>
        <p aria-hidden="true" className="label mt-16 text-fg-subtle">Ideas / Build / Ship / Repeat.</p>
        <p className="sr-only">{siteMeta.name}</p>
      </div>
    </section>
  );
}
