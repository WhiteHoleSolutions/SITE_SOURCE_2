const steps = [
  ['01', 'Tell us the outcome', 'Share your goal, deadline and the assets you need.'],
  ['02', 'Plan the right production', 'We scope the work, organise the equipment and agree on deliverables.'],
  ['03', 'Create, review, refine', 'You receive a clear proofing and feedback process—not a black box.'],
  ['04', 'Receive ready-to-use assets', 'Approved work is delivered in the formats your channels actually need.'],
]

export default function Process() {
  return (
    <section id="process" className="relative overflow-hidden bg-[#111211] py-24 text-white sm:py-32">
      <div className="absolute inset-0 studio-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="editorial-kicker text-[#c6ff43]">A clearer creative process</p>
          <h2 className="text-balance text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Good work should feel organised from day one.</h2>
          <p className="text-lg leading-8 text-white/65">Whether the job is a single product image or a complete campaign, you always know what happens next.</p>
        </div>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, description]) => (
            <li key={number} className="bg-[#151715] p-7 sm:p-8">
              <span className="text-sm font-bold tracking-widest text-[#c6ff43]">{number}</span>
              <h3 className="mt-12 text-xl font-semibold tracking-[-.025em]">{title}</h3>
              <p className="mt-3 leading-7 text-white/60">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
