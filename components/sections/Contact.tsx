import { socials, siteMeta, availability } from "@/data/socials";
import { ButtonLink } from "@/components/ui/Button";
import { PhoneReveal } from "@/components/ui/PhoneReveal";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/ui/icons";
import "./contact.css";

/** Spec §5.6: "Let's build / something great." over the planet-horizon light; one primary action. */
export function Contact() {
  // The closing action system: four channels in one recipe — icon, a label, the value you'll reach.
  const channel = "contact__channel group/row";
  return (
    <section id="contact" aria-labelledby="contact-title" data-theme="dark" className="contact seam-top-dark seam-bottom-dark relative overflow-hidden bg-[var(--bg)]">
      <div className="shell relative py-[clamp(8rem,18vh,14rem)] text-center">
        {availability.open && <p className="label relative z-[1] inline-flex items-center gap-2 text-fg-muted"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--status-live)]" />{availability.label}</p>}
        <h2 id="contact-title" className="relative z-[1] mt-6 text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
          Let&apos;s build<br /><span className="text-fg-muted">something great.</span>
        </h2>
        <p className="relative z-[1] mx-auto mt-6 max-w-[52ch] text-fg-muted" style={{ fontSize: "var(--text-lead)" }}>{availability.detail}</p>
        {/* The horizon hangs from just above the CTA (not from the section), so on every size its rim passes over
            the CTA and the channel row instead of through them. The copy around it sits on z-1 so the opaque arc
            never paints over it. */}
        <div className="contact__actions relative z-0 pt-10">
        <div className="contact__horizon" aria-hidden="true" />
        <div className="flex justify-center"><ButtonLink href={`mailto:${socials.email}?subject=${encodeURIComponent("Hello Tay")}`} size="lg">Get in touch</ButtonLink></div>
        <address className="mt-8 flex flex-wrap justify-center gap-3 not-italic">
          <a className={channel} href={socials.github.url} target="_blank" rel="noopener noreferrer"><GithubIcon size={18} /><span><span className="label">GitHub</span><span className="contact__value">{socials.github.handle}</span></span><span className="sr-only"> (opens in a new tab)</span></a>
          <a className={channel} href={socials.linkedin.url} target="_blank" rel="noopener noreferrer"><LinkedinIcon size={18} /><span><span className="label">LinkedIn</span><span className="contact__value">{socials.linkedin.label}</span></span><span className="sr-only"> (opens in a new tab)</span></a>
          <a className={channel} href={`mailto:${socials.email}`}><MailIcon size={18} /><span><span className="label">Email</span><span className="contact__value">{socials.email}</span></span></a>
          <PhoneReveal className={channel} />
        </address>
        </div>
        <p aria-hidden="true" className="label relative z-[1] mt-16 text-fg-subtle">Ideas / Build / Ship / Repeat.</p>
        <p className="sr-only">{siteMeta.name}</p>
      </div>
    </section>
  );
}
