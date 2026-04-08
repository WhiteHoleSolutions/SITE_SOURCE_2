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

  useEffect(() => {
    fetch('/api/albums')
      .then(res => res.json())
      .then(data => setAlbums(data.albums || []))
      .catch(console.error)
  }, [])

  return (
    <section id="portfolio" className="py-12 sm:py-16 md:py-20 bg-dark-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark-900 mb-3 sm:mb-4">
            Our Portfolio
          </h2>
          <p className="text-base sm:text-lg text-dark-600 max-w-2xl mx-auto px-4">
            Explore our collection of professional media work
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="relative h-64 sm:h-72 md:h-80 rounded-lg overflow-hidden shadow-lg">
                {album.coverImage ? (
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 protected-image"
                  />
                ) : album.media[0] ? (
                  album.media[0].type === 'IMAGE' ? (
                    <Image
                      src={album.media[0].url}
                      alt={album.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500 protected-image"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={album.media[0].url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="text-white" size={48} />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{album.title}</h3>
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
