'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [businessInfo, setBusinessInfo] = useState({
    businessName: 'White Hole Solutions',
    email: 'info@whiteholesolutions.com',
    phone: '+1 (555) 123-4567',
  })

  useEffect(() => {
    fetch('/api/business-info/public')
      .then(res => res.json())
      .then(data => {
        if (data.businessInfo) {
          setBusinessInfo({
            businessName: data.businessInfo.businessName || 'White Hole Solutions',
            email: data.businessInfo.email || 'info@whiteholesolutions.com',
            phone: data.businessInfo.phone || '+1 (555) 123-4567',
          })
        }
      })
      .catch(console.error)
  }, [])

  return (
    <footer className="bg-dark-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{businessInfo.businessName}</h3>
            <p className="text-dark-300">
              Professional business media solutions tailored to your needs.
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
              <li>Email: {businessInfo.email}</li>
              <li>Phone: {businessInfo.phone}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-800 text-center text-dark-400">
          <p>&copy; {currentYear} {businessInfo.businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
