import { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  photos: string[]
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function Lightbox({
  photos,
  activeIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const touchStartX = useRef(0)

  const goPrev = useCallback(() => {
    onNavigate((activeIndex - 1 + photos.length) % photos.length)
  }, [activeIndex, photos.length, onNavigate])

  const goNext = useCallback(() => {
    onNavigate((activeIndex + 1) % photos.length)
  }, [activeIndex, photos.length, onNavigate])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, goPrev, goNext])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext()
      else goPrev()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Previous arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={photos[activeIndex]}
        alt={`Photo ${activeIndex + 1} of ${photos.length}`}
        className="max-h-[85vh] max-w-[95vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        draggable={false}
      />

      {/* Next arrow */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
          {activeIndex + 1} / {photos.length}
        </div>
      )}
    </div>,
    document.body
  )
}
