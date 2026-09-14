'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Play } from 'lucide-react'

interface Media {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  thumbnailUrl?: string
  title?: string
}

interface Album {
  id: string
  title: string
  description?: string
  coverImage?: string
  media: Media[]
}

export default function Portfolio() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetch('/api/albums/public')
      .then(res => { if (!res.ok) throw new Error('Unable to load work'); return res.json() })
      .then(data => setAlbums(data.albums || []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  const markLoaded = (key: string) => {
    setLoadedAssets(current => current.has(key) ? current : new Set(current).add(key))
  }

  return (
    <section id="portfolio" className="bg-[#0b1423] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 max-w-3xl sm:mb-16"
        >
          <p className="editorial-kicker mb-5 text-blue-300">02 / The work</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-.045em] text-white mb-4">
            Less explaining.<br /><span className="font-serif italic font-normal text-blue-300">More showing.</span>
          </h2>
          <p className="mt-6 text-base leading-8 sm:text-lg text-slate-400 max-w-xl">
            A selection of visual work, campaign assets and practical production outcomes.
          </p>
        </motion.div>

        {loading && <div role="status" className="grid gap-6 sm:grid-cols-2"><div className="h-80 animate-pulse rounded-xl bg-white/5" /><div className="h-80 animate-pulse rounded-xl bg-white/5" /><span className="sr-only">Loading portfolio</span></div>}
        {!loading && !albums.length && <div className="rounded-2xl border border-white/15 p-8"><p className="text-xl text-white">{loadError ? 'The portfolio is temporarily unavailable.' : 'Your next idea belongs here.'}</p><p className="mt-3 text-sm text-slate-400">Tell us what you have in mind and we can discuss the right approach.</p><a href="#contact" className="mt-5 inline-block text-sm font-semibold text-blue-300 hover:text-white">Start a conversation →</a></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.08, 0.3) }}
              className={`group cursor-pointer rounded-xl outline-offset-8 ${index % 4 === 1 ? 'sm:mt-16' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Open album: ${album.title}`}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedAlbum(album) } }}
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="relative h-80 sm:h-96 md:h-[30rem] overflow-hidden rounded-xl bg-white/10">
                {album.coverImage ? (
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    fill
                    className={`object-cover group-hover:scale-110 transition-all duration-700 protected-image ${loadedAssets.has(`cover-${album.id}`) ? 'opacity-100' : 'opacity-0'}`}
                    onLoadingComplete={() => markLoaded(`cover-${album.id}`)}
                  />
                ) : album.media[0] ? (
                  album.media[0].type === 'IMAGE' ? (
                    <Image
                      src={album.media[0].url}
                      alt={album.title}
                      fill
                      className={`object-cover group-hover:scale-110 transition-all duration-700 protected-image ${loadedAssets.has(album.media[0].id) ? 'opacity-100' : 'opacity-0'}`}
                      onLoadingComplete={() => markLoaded(album.media[0].id)}
                    />
                  ) : (
                    <div className={`relative h-full w-full transition-opacity duration-700 ${loadedAssets.has(album.media[0].id) ? 'opacity-100' : 'opacity-0'}`}>
                      <video
                        src={album.media[0].url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedData={() => markLoaded(album.media[0].id)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="text-white" size={48} />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-[-.03em] mb-1 sm:mb-2">{album.title}</h3>
                  {album.description && (
                    <p className="text-sm sm:text-base text-white/90 line-clamp-2">{album.description}</p>
                  )}
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/70">
                    {album.media.length} {album.media.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Album Modal */}
      {selectedAlbum && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAlbum(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-bold text-dark-900">{selectedAlbum.title}</h3>
                  {selectedAlbum.description && (
                    <p className="text-dark-600 mt-2">{selectedAlbum.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="text-dark-600 hover:text-dark-900 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
              {selectedAlbum.media.map(media => (
                <div
                  key={media.id}
                  className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedMedia(media)}
                >
                  {media.type === 'IMAGE' ? (
                    <Image
                      src={media.thumbnailUrl || media.url}
                      alt={media.title || 'Media'}
                      fill
                      className="object-cover group-hover:scale-110 transition protected-image"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="text-white" size={48} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-7xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {selectedMedia.type === 'IMAGE' ? (
              <div className="relative w-full h-full">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.title || 'Media'}
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-[90vh] object-contain protected-image"
                />
              </div>
            ) : (
              <video
                src={selectedMedia.url}
                controls
                className="max-w-full max-h-[90vh]"
                autoPlay
                playsInline
                preload="auto"
              />
            )}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-primary-400"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
