const steps = [
  ['01', 'Tell us the outcome', 'Share your goal, deadline and the assets you need.'],
  ['02', 'Plan the right production', 'We scope the work, organise the equipment and agree on deliverables.'],
  ['03', 'Create, review, refine', 'You receive a clear proofing and feedback process—not a black box.'],
  ['04', 'Receive ready-to-use assets', 'Approved work is delivered in the formats your channels actually need.'],
]

export default function Process() {
  return (
    <section id="process" className="bg-dark-900 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-300">A clearer creative process</p>
          <h2 className="text-balance text-3xl font-bold sm:text-5xl">Good work should feel organised from day one.</h2>
          <p className="text-lg leading-8 text-dark-300">Whether the job is a single product image or a complete campaign, you always know what happens next.</p>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, description]) => (
            <li key={number} className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <span className="text-sm font-bold tracking-widest text-primary-300">{number}</span>
              <h3 className="mt-8 text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-dark-300">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
