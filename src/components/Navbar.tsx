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
      scrolled ? 'bg-[#f4f1eb]/95 shadow-[0_8px_30px_rgba(17,18,17,.08)] backdrop-blur-xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-bold transition-colors ${
              scrolled ? 'text-[#111211]' : 'text-white'
            }`}>
              {businessName}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#services" className={`text-sm font-medium hover:text-[#7fbb16] transition ${
              scrolled ? 'text-dark-900' : 'text-white'
            }`}>
              Services
            </Link>
            <Link href="/#portfolio" className={`text-sm font-medium hover:text-[#7fbb16] transition ${
              scrolled ? 'text-dark-900' : 'text-white'
            }`}>
              Portfolio
            </Link>
            <Link href="/#process" className={`text-sm font-medium hover:text-[#7fbb16] transition ${
              scrolled ? 'text-dark-900' : 'text-white'
            }`}>
              Process
            </Link>
            <Link 
              href="/login" 
              className="bg-[#2563eb] hover:bg-[#3b82f6] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition"
            >
              Client portal
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
        <div className="md:hidden bg-[#f4f1eb] shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/#services" className="block px-3 py-2 text-dark-900 hover:bg-primary-50">
              Services
            </Link>
            <Link href="/#portfolio" className="block px-3 py-2 text-dark-900 hover:bg-primary-50">
              Portfolio
            </Link>
            <Link href="/#process" className="block px-3 py-2 text-dark-900 hover:bg-primary-50">
              Process
            </Link>
            <Link href="/login" className="block px-3 py-2 text-primary-600 font-semibold">
              Client portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
