'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Brand {
  id: string
  name: string
  logoUrl: string
  websiteUrl?: string | null
}

export default function BrandShowcase() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    fetch('/api/brands/public')
      .then(response => response.json())
      .then(data => setBrands(data.brands || []))
      .catch(console.error)
  }, [])

  if (brands.length === 0) return null

  return (
    <section className="bg-[#f8f6f1] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="editorial-kicker text-[#216ac4]">Selected clients</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#111211] sm:text-4xl">Proud to make work with</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#62665f]">A few of the businesses that have trusted White Hole Solutions with their ideas.</p>
        </div>

        <div className="mt-10 grid grid-cols-2 overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map(brand => {
            const content = (
              <>
                <div className="relative h-16 w-full sm:h-20">
                  <Image src={brand.logoUrl} alt={`${brand.name} logo`} fill className="object-contain" sizes="(max-width: 640px) 45vw, 20vw" />
                </div>
                <span className="mt-3 block truncate text-center text-xs font-semibold text-[#444842]">{brand.name}</span>
              </>
            )

            return brand.websiteUrl ? (
              <a key={brand.id} href={brand.websiteUrl} target="_blank" rel="noreferrer" className="group bg-[#f8f6f1] p-5 transition hover:bg-white sm:p-7" aria-label={`Visit ${brand.name}`}>
                {content}
              </a>
            ) : (
              <div key={brand.id} className="bg-[#f8f6f1] p-5 sm:p-7">{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
