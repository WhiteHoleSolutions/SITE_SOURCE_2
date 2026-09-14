'use client'

import { useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight, Pause, Play, Shuffle } from 'lucide-react'

interface HeroMedia { url: string; type: 'IMAGE' | 'VIDEO'; album: string }

export default function Hero() {
  const [media, setMedia] = useState<HeroMedia[]>([])
  const [slide, setSlide] = useState({ current: 0, previous: -1 })
  const [loaded, setLoaded] = useState<Set<string>>(new Set())
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    fetch('/api/albums/public').then(response => response.json()).then(data => {
      if (cancelled) return
      const assets: HeroMedia[] = (data.albums || []).flatMap((album: { title: string; media?: { url: string; type: 'IMAGE' | 'VIDEO' }[] }) => (album.media || []).map(item => ({ ...item, album: album.title })))
      setMedia(assets)
      setSlide({ current: Math.floor(Math.random() * Math.max(1, assets.length)), previous: -1 })
    }).catch(() => { /* Keep the designed background if media is unavailable. */ })
    return () => { cancelled = true }
  }, [])

  const shuffle = useCallback(() => {
    if (media.length < 2) return
    setSlide(old => ({ previous: old.current, current: (old.current + 1 + Math.floor(Math.random() * (media.length - 1))) % media.length }))
  }, [media.length])
  useEffect(() => {
    if (paused || reducedMotion || media.length < 2) return
    const timer = setInterval(shuffle, 7000)
    return () => clearInterval(timer)
  }, [shuffle, paused, reducedMotion, media.length])
  const ready = (url: string) => setLoaded(current => new Set(current).add(url))
  const currentReady = media[slide.current] && loaded.has(media[slide.current].url)

  return <section className="relative isolate overflow-hidden bg-[#0b1423] text-white">
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-orbit" />
      {media.map((item, index) => index === slide.current || index === slide.previous ? <div key={`${item.url}-${index}`} className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${index === slide.current ? (currentReady ? 'opacity-100' : 'opacity-0') : (currentReady ? 'opacity-0' : 'opacity-100')}`}>
        {item.type === 'IMAGE' ? <Image src={item.url} alt="" fill sizes="100vw" priority={index === slide.current} className="object-cover" onLoad={() => ready(item.url)} /> : <video src={item.url} muted loop playsInline autoPlay={!paused && !reducedMotion} ref={element => { if (element) { if (paused || reducedMotion) element.pause(); else void element.play().catch(() => {}) } }} preload="metadata" onLoadedData={() => ready(item.url)} className="h-full w-full object-cover" />}
      </div> : null)}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07101e]/95 via-[#07101e]/70 to-[#07101e]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07101e] via-transparent to-[#07101e]/30" />
    </div>
    <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-40 sm:px-8 sm:pt-48 lg:px-10 lg:pt-52">
      <div className="flex items-center gap-3"><span className="h-px w-10 bg-blue-400" /><p className="editorial-kicker text-blue-200">Independent creative & digital studio</p></div>
      <h1 className="mt-8 max-w-4xl text-[clamp(3.4rem,8.4vw,7.6rem)] font-medium leading-[.96] tracking-[-.065em]">Make an<br />impression.<br /><span className="font-serif italic font-normal text-blue-300">Make it yours.</span></h1>
      <div className="mt-9 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <div className="max-w-lg"><p className="text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">Photography, film, print and digital experiences.<br className="hidden sm:block" /> Made for your business. Made for your next idea.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#contact" className="inline-flex items-center gap-8 rounded-full bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-500">Let’s make something <ArrowUpRight size={18} /></a><a href="#portfolio" className="inline-flex items-center gap-3 rounded-full border border-white/30 px-6 py-4 text-sm font-medium transition hover:bg-white/10">Explore the work <ArrowDown size={16} /></a></div></div>
        <div className="max-w-xs border-l border-white/25 pl-5"><p className="editorial-kicker text-blue-300">From pixels to physical</p><p className="mt-3 text-sm leading-6 text-white/65">A single product. A personal project. A complete brand presence. One studio to bring it together.</p></div>
      </div>
      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5 sm:mt-20"><p className="text-xs tracking-wide text-slate-400">PHOTO / FILM / PRINT / WEB / SOFTWARE</p>{media.length > 0 && <div className="flex items-center gap-3"><p className="max-w-[160px] truncate text-xs text-slate-300">{media[slide.current]?.album}</p><button aria-label={paused ? 'Play portfolio reel' : 'Pause portfolio reel'} aria-pressed={paused} onClick={() => setPaused(!paused)} className="rounded-full border border-white/25 p-2.5 hover:bg-white/10">{paused ? <Play size={14} /> : <Pause size={14} />}</button>{media.length > 1 && <button aria-label="Show another public work" onClick={shuffle} className="rounded-full border border-white/25 p-2.5 hover:bg-white/10"><Shuffle size={14} /></button>}</div>}</div>
    </div>
  </section>
}
