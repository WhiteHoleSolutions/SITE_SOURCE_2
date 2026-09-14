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
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(new Set())
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

    // The public endpoint returns PUBLIC albums only. Include every item in
    // those albums so the hero becomes a complete public-work reel.
    fetch('/api/albums/public')
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
        if (heroMedia.length === 1) return 0

        let nextIndex
        do {
          nextIndex = Math.floor(Math.random() * heroMedia.length)
        } while (nextIndex === prev)
        return nextIndex
      })
    }, 5000)

    return () => clearInterval(timer)
  }, [heroMedia.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (heroMedia.length === 1) return 0
      
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * heroMedia.length)
      } while (nextIndex === prev)
      return nextIndex
    })
  }

  const markMediaLoaded = (url: string) => {
    setLoadedMedia(current => current.has(url) ? current : new Set(current).add(url))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (heroMedia.length === 1) return 0
      
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * heroMedia.length)
      } while (nextIndex === prev)
      return nextIndex
    })
  }

  return (
    <section className="relative min-h-[760px] h-screen w-full overflow-hidden bg-[#111211]">
      {/* Background Media Slider */}
      {heroMedia.length > 0 ? (
        <div className="absolute inset-0">
          {heroMedia.map((media, index) => (
            <div
              key={`${media.url}-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide && loadedMedia.has(media.url) ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {media.type === 'IMAGE' ? (
                <Image
                  src={media.url}
                  alt="Hero background"
                  fill
                  className="object-cover protected-image"
                  priority={index === 0}
                  onLoadingComplete={() => markMediaLoaded(media.url)}
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
                  onCanPlay={() => markMediaLoaded(media.url)}
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />
      <div className="absolute inset-0 studio-grid opacity-30" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-5 pb-24 pt-32 sm:px-8 sm:pb-28 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl text-left"
        >
          <p className="editorial-kicker mb-5 text-[#65a7ff]">Creative production · Digital systems</p>
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[.92] tracking-[-.06em] text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl mb-6">
            {businessName}
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-white/80 sm:text-xl sm:leading-8 md:text-2xl mb-8 sm:mb-10">
            From first idea to finished media, promotion and digital tools.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <a
              href="#portfolio"
              className="bg-[#2563eb] hover:bg-[#3b82f6] active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition transform hover:scale-105"
            >
              Explore our work
            </a>
            <a
              href="#contact"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition border border-white/50"
            >
              Start a project
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-5 z-10 sm:right-8 lg:right-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border border-white/70 rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}
