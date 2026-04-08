'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroMedia {
  url: string
  type: 'IMAGE' | 'VIDEO'
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([])
  const [businessName, setBusinessName] = useState('White Hole Solutions')

  useEffect(() => {
    // Fetch business info
    fetch('/api/business-info/public')
      .then(res => res.json())
      .then(data => {
        if (data.businessInfo?.businessName) {
          setBusinessName(data.businessInfo.businessName)
        }
      })
      .catch(console.error)

    // Fetch public albums for hero display
    fetch('/api/albums')
      .then(res => res.json())
      .then(data => {
        const media: HeroMedia[] = []
        data.albums?.forEach((album: any) => {
          album.media?.forEach((m: any) => {
            media.push({ url: m.url, type: m.type })
          })
        })
        setHeroMedia(media)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (heroMedia.length === 0) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        // Pick a random index that's different from the current one
        if (heroMedia.length === 1) return 0
        
        let newIndex
        do {
          newIndex = Math.floor(Math.random() * heroMedia.length)
        } while (newIndex === prev)
        
        return newIndex
      })
    }, 5000)

    return () => clearInterval(timer)
  }, [heroMedia.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (heroMedia.length === 1) return 0
      
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * heroMedia.length)
      } while (newIndex === prev)
      
      return newIndex
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (heroMedia.length === 1) return 0
      
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * heroMedia.length)
      } while (newIndex === prev)
      
      return newIndex
    })
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Media Slider */}
      {heroMedia.length > 0 ? (
        <div className="absolute inset-0">
          {heroMedia.map((media, index) => (
            <div
              key={`${media.url}-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {media.type === 'IMAGE' ? (
                <Image
                  src={media.url}
                  alt="Hero background"
                  fill
                  className="object-cover protected-image"
                  priority={index === 0}
                />
              ) : (
                <video
                  key={`video-${media.url}`}
                  src={media.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}

          {/* Navigation Arrows */}
          {heroMedia.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-sm p-2 sm:p-3 rounded-full transition z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="text-white" size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-sm p-2 sm:p-3 rounded-full transition z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="text-white" size={20} />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6">
            {businessName}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8">
            Professional Business Media Solutions
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <a
              href="#portfolio"
              className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition transform hover:scale-105"
            >
              View Our Work
            </a>
            <a
              href="#contact"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition border-2 border-white"
            >
              Get in Touch
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}
