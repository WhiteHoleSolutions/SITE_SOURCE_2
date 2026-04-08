'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [businessName, setBusinessName] = useState('White Hole Solutions')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Fetch business name
    fetch('/api/business-info/public')
      .then(res => res.json())
      .then(data => {
        if (data.businessInfo?.businessName) {
          setBusinessName(data.businessInfo.businessName)
        }
      })
      .catch(console.error)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-bold transition-colors ${
              scrolled ? 'text-primary-600' : 'text-white'
            }`}>
              {businessName}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#portfolio" className={`hover:text-primary-500 transition ${
              scrolled ? 'text-dark-900' : 'text-white'
            }`}>
              Portfolio
            </Link>
            <Link href="/#contact" className={`hover:text-primary-500 transition ${
              scrolled ? 'text-dark-900' : 'text-white'
            }`}>
              Contact
            </Link>
            <Link 
              href="/login" 
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full transition"
            >
              Client Login
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? (
              <X className={scrolled ? 'text-dark-900' : 'text-white'} />
            ) : (
              <Menu className={scrolled ? 'text-dark-900' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/#portfolio" className="block px-3 py-2 text-dark-900 hover:bg-primary-50">
              Portfolio
            </Link>
            <Link href="/#contact" className="block px-3 py-2 text-dark-900 hover:bg-primary-50">
              Contact
            </Link>
            <Link href="/login" className="block px-3 py-2 text-primary-600 font-semibold">
              Client Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
