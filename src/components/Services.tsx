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
    <section id="services" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">What we make</p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-dark-900 sm:text-5xl">
            One creative partner, from first brief to finished asset.
          </h2>
          <p className="mt-5 text-lg leading-8 text-dark-600">
            White Hole Solutions combines digital production, physical promotional material and practical software so your work stays connected.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description }) => (
            <article key={title} className="group rounded-2xl border border-dark-200 bg-dark-50 p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:bg-white hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-dark-900">{title}</h3>
              <p className="mt-3 leading-7 text-dark-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
