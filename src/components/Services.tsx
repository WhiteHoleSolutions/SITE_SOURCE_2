import { Camera, Clapperboard, LayoutPanelTop, PackageCheck } from 'lucide-react'

const services = [
  {
    icon: Camera,
    title: 'Photo & aerial video',
    description: 'Campaign imagery, drone footage and polished video built around the way your business needs to be seen.',
  },
  {
    icon: PackageCheck,
    title: 'Product imaging',
    description: 'Consistent, catalogue-ready images for individual stock items, online stores and sales campaigns.',
  },
  {
    icon: Clapperboard,
    title: 'Print & promotional material',
    description: 'Cards, signage, uniforms and practical campaign assets that carry your brand into the real world.',
  },
  {
    icon: LayoutPanelTop,
    title: 'Websites & custom software',
    description: 'Front-end experiences and back-end tools shaped around your actual workflow—not a generic template.',
  },
]

export default function Services() {
  return (
    <section id="services" className="bg-[#f4f1eb] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="editorial-kicker text-[#216ac4]">What we make</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-.045em] text-[#111211] sm:text-6xl">
            One creative partner, from first brief to finished asset.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#62665f]">
            White Hole Solutions combines digital production, physical promotional material and practical software so your work stays connected.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description }) => (
            <article key={title} className="group bg-[#f8f6f1] p-7 transition hover:bg-white sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111211] text-[#65a7ff] transition group-hover:scale-110">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="mt-12 text-xl font-semibold tracking-[-.025em] text-[#111211]">{title}</h3>
              <p className="mt-3 leading-7 text-[#62665f]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
