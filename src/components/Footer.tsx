'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [businessInfo, setBusinessInfo] = useState({
    businessName: 'White Hole Solutions',
    email: '',
    phone: '',
  })

  useEffect(() => {
    fetch('/api/business-info/public')
      .then(res => res.json())
      .then(data => {
        if (data.businessInfo) {
          setBusinessInfo({
            businessName: data.businessInfo.businessName || 'White Hole Solutions',
            email: data.businessInfo.email || '',
            phone: data.businessInfo.phone || '',
          })
        }
      })
      .catch(console.error)
  }, [])

  return (
    <footer className="bg-[#07101e] text-white py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{businessInfo.businessName}</h3>
            <p className="text-dark-300">
              Creative production and digital tools that move your business forward.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#portfolio" className="text-dark-300 hover:text-white transition">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-dark-300 hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-dark-300 hover:text-white transition">
                  Client Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-dark-300">
              {businessInfo.email && <li><a className="hover:text-blue-300" href={`mailto:${businessInfo.email}`}>{businessInfo.email}</a></li>}
              {businessInfo.phone && <li><a className="hover:text-blue-300" href={`tel:${businessInfo.phone}`}>{businessInfo.phone}</a></li>}
              {!businessInfo.email && !businessInfo.phone && <li><Link href="/#contact" className="hover:text-blue-300">Send a project inquiry →</Link></li>}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 text-center text-white/45">
          <p>&copy; {currentYear} {businessInfo.businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
