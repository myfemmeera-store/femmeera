'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cmsService, PublicHeroBanner } from '@/services/cmsService';

interface Slide {
  id: number;
  image: string;
  mobileImage?: string;
  tag?: string;
  title?: string;
  description?: string;
  buttonText: string;
  link: string;
}

const fallbackSlides: Slide[] = [
  {
    id: 1,
    image: '/images/hero1_image.png',
    mobileImage: '/images/hero1_image.png',
    buttonText: 'SHOP TRADITIONAL',
    link: '/women/traditional-wear',
  },
  {
    id: 2,
    image: '/images/hero2_image.png',
    mobileImage: '/images/hero2_image.png',
    buttonText: 'SHOP WESTERN',
    link: '/women/western-wear',
  },
];

export const HeroSlider: React.FC = () => {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    cmsService.getHeroBanners().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const formatted = res.data.map((b) => ({
          id: b.id,
          image: b.image_url,
          mobileImage: b.mobile_image_url || b.image_url,
          tag: b.subtitle || '',
          title: b.title || '',
          description: '',
          buttonText: b.button_text || 'SHOP NOW',
          link: b.button_url || '/shop',
        }));
        setSlides(formatted);
      }
    });
  }, []);

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, slides]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe Gestures for Mobile & Touch Devices
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const slide = slides[currentSlide] || slides[0];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FAF6F0]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 100% Full Width Hero Slider Stage */}
      <div className="relative w-full h-[520px] sm:h-[650px] lg:h-[720px] cursor-pointer" onClick={() => router.push(slide.link)}>
        {slides.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Desktop Image */}
              <div className="hidden sm:block absolute inset-0">
                <Image
                  src={s.image}
                  alt={s.title || 'Hero Banner'}
                  fill
                  priority={idx === 0}
                  className="object-cover object-top filter brightness-[0.92]"
                />
              </div>

              {/* Mobile Image */}
              <div className="sm:hidden absolute inset-0">
                <Image
                  src={s.mobileImage || s.image}
                  alt={s.title || 'Hero Banner'}
                  fill
                  priority={idx === 0}
                  className="object-cover object-top filter brightness-[0.92]"
                />
              </div>

              {/* Overlay Content */}
              {(s.title || s.tag || s.buttonText) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 sm:p-16 lg:p-24 text-white">
                  <div className="max-w-7xl mx-auto w-full space-y-4">
                    {s.tag && (
                      <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.25em] text-[#E8C68A] uppercase block">
                        {s.tag}
                      </span>
                    )}

                    {s.title && (
                      <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-tight max-w-2xl">
                        {s.title}
                      </h1>
                    )}

                    {s.description && (
                      <p className="text-sm sm:text-base text-neutral-200 max-w-lg leading-relaxed font-sans">
                        {s.description}
                      </p>
                    )}

                    <div className="pt-4" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={s.link}
                        className="inline-flex items-center space-x-3 px-8 py-3.5 bg-black/20 hover:bg-black/40 border border-[#c5a059] backdrop-blur-md text-white font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all hover:scale-105"
                      >
                        <span>{s.buttonText}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Left/Right Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Bottom Indicator Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-[#B38548]' : 'w-2.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
