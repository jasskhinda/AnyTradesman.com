'use client';

import { useState, useEffect } from 'react';

interface HeroSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
}

interface HeroSectionProps {
  displayMode: 'slider' | 'video';
  slides: HeroSlide[];
  videoUrl: string | null;
  autoplayInterval: number;
  children: React.ReactNode;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${ytMatch[1]}&showinfo=0&rel=0`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1`;
  }
  return null;
}

export function HeroSection({ displayMode, slides, videoUrl, autoplayInterval, children }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (displayMode !== 'slider' || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [displayMode, slides.length, autoplayInterval]);

  // Video mode
  if (displayMode === 'video' && videoUrl) {
    const embedUrl = getEmbedUrl(videoUrl);
    if (embedUrl) {
      return (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <iframe
              src={embedUrl}
              className="absolute"
              style={{
                border: 'none',
                pointerEvents: 'none',
                top: '50%',
                left: '50%',
                width: '177.78vh', /* 100 * 16/9 */
                height: '56.25vw', /* 100 * 9/16 */
                minWidth: '100%',
                minHeight: '100%',
                transform: 'translate(-50%, -50%)',
              }}
              allow="autoplay; fullscreen"
              title="Hero video"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            {children}
          </div>
        </section>
      );
    }
  }

  // Slider mode
  if (displayMode === 'slider' && slides.length > 0) {
    return (
      <section className="relative">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${slide.image_url}')`,
              opacity: index === currentSlide ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          {children}
          {slides.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Fallback: static banner
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/banner.png')" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        {children}
      </div>
    </section>
  );
}
