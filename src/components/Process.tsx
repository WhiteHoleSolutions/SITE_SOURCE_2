import { ArrowUpRight } from 'lucide-react'

const steps = [
  ['01', 'The conversation', 'Tell us what you have in mind, who it’s for and when you need it. We’ll work out what the project needs.'],
  ['02', 'The plan', 'Agree on the scope, deliverables and production details. A clear direction before the making begins.'],
  ['03', 'The making', 'Capture, design or build. Review the work together, share feedback and refine the details.'],
  ['04', 'The handover', 'Receive the finished work in the agreed formats, ready for its next chapter.'],
]

export default function Process() {
  return <section id="process" className="relative overflow-hidden bg-[#101c30] py-24 text-white sm:py-32"><div className="pointer-events-none absolute -left-48 top-20 h-[500px] w-[500px] rounded-full border border-blue-400/15" /><div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-10"><div><p className="editorial-kicker text-blue-300">03 / Working together</p><h2 className="mt-5 text-4xl font-medium leading-[1.05] tracking-[-.05em] sm:text-6xl">A good result<br />starts with a<br /><span className="font-serif italic text-blue-300">clear process.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-slate-400">From the first conversation to final delivery, keep the work connected. Your client portal brings assigned jobs and project progress into one place.</p><a href="/login" className="mt-8 inline-flex items-center gap-4 border-b border-blue-400/50 pb-2 text-sm text-blue-200 hover:text-white">Already working with us? Client portal <ArrowUpRight size={16} /></a></div><ol className="divide-y divide-white/15 border-t border-white/15">{steps.map(([number, title, description]) => <li key={number} className="flex gap-6 py-8"><span className="pt-1 text-xs text-blue-300">{number}</span><div><h3 className="text-2xl font-medium tracking-tight">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{description}</p></div></li>)}</ol></div></section>
}
