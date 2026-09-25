const steps = [
  { n: "01", title: "Think", copy: "Architecture before implementation. Understand the problem, the constraints, and the failure modes." },
  { n: "02", title: "Build", copy: "Clean boundaries, maintainable code, and a product experience that gets the details right." },
  { n: "03", title: "Ship", copy: "Test it. Deploy it. Observe it. Improve it. Software matters when real people can use it." },
];

export function Process() {
  return (
    <section className="process-section section-shell" aria-labelledby="process-title">
      <div className="section-eyebrow">My approach</div>
      <h2 id="process-title">Think. Build. Ship.</h2>
      <div className="process-line" aria-hidden="true"><i/><i/><i/></div>
      <div className="process-grid">{steps.map((step) => <div className="process-card" key={step.title}><span>{step.n}</span><h3>{step.title}</h3><p>{step.copy}</p></div>)}</div>
    </section>
  );
}
