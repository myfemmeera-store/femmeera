import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Sparkles, Heart, ShieldCheck, Truck, Award, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Femmeera | Women's Traditional & Western Fashion",
  description: "Learn about Femmeera, an online women's fashion brand offering traditional Indian wear and modern western clothing.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Header */}
        <div className="text-center space-y-4 border-b border-[#EFE6D8] pb-10">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#B38548] uppercase">
            OUR BRAND & STORY
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-neutral-900 leading-tight">
            About Femmeera
          </h1>
          <p className="text-xs sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed font-sans">
            Welcome to Femmeera, an online fashion destination created for women who love to express themselves through style.
          </p>
        </div>

        {/* Brand Statement Banner */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FAF4EB] text-[#B38548] flex items-center justify-center mx-auto border border-[#EFE5D5]">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-neutral-900">
            Fashion Made For You
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-2xl mx-auto">
            We believe fashion is more than clothing. It is a way to express personality, confidence, culture and individuality. Femmeera brings together traditional Indian fashion and contemporary western styles, giving women the freedom to discover outfits that match their personality and occasion.
          </p>
        </div>

        {/* Our Collections Section */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-medium text-neutral-900 text-center">
            Our Collections
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-[#B38548] uppercase">COLLECTION 01</span>
              <h3 className="font-serif text-xl font-bold text-neutral-900">Traditional Wear</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Discover elegant styles inspired by Indian fashion and craftsmanship. Our traditional collection is designed for festivals, celebrations, weddings, family occasions and everyday elegance.
              </p>
              <div className="pt-2">
                <Link href="/women/traditional-wear" className="text-xs font-bold text-[#B38548] hover:underline">
                  Explore Traditional Wear →
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-[#B38548] uppercase">COLLECTION 02</span>
              <h3 className="font-serif text-xl font-bold text-neutral-900">Western Wear</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Explore modern and versatile outfits designed for casual outings, parties, special occasions and everyday fashion.
              </p>
              <div className="pt-2">
                <Link href="/women/western-wear" className="text-xs font-bold text-[#B38548] hover:underline">
                  Explore Western Wear →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated OUR STORY Section */}
        <div id="our-story" className="bg-[#FAF4EB] p-8 sm:p-12 rounded-3xl border border-[#EFE6D8] space-y-6 scroll-mt-20">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#B38548] uppercase">OUR JOURNEY</span>
            <h2 className="font-serif text-3xl font-medium text-neutral-900">Our Story</h2>
            <p className="text-xs text-neutral-500 italic">
              Discover the story behind Femmeera and our vision for bringing traditional and western women's fashion together online.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
            <p>
              Femmeera was created with a simple idea: fashion should give every woman the freedom to express herself.
            </p>
            <p>
              Women today move between different worlds — traditional celebrations, professional environments, casual outings, parties and everyday life. We wanted to create a fashion destination where different styles could come together in one place.
            </p>
            <p>
              That's why Femmeera brings together traditional women's wear and modern western fashion.
            </p>
            <p>
              Our journey is focused on discovering beautiful designs, understanding changing fashion preferences and creating a shopping experience that makes finding the right outfit easier.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E8DEC8] grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-neutral-900">Our Vision</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                We envision Femmeera as a trusted fashion destination where women can discover clothing that makes them feel confident, comfortable and themselves.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-neutral-900">Growing With Our Customers</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                As Femmeera grows, we continue to expand our collections, improve our shopping experience and listen to our customers. Our story is still being written — and we're excited to have you be part of it.
              </p>
            </div>
          </div>
        </div>

        {/* Our Mission Grid */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-6">
          <h2 className="font-serif text-2xl font-medium text-neutral-900 text-center">
            Our Mission & Core Values
          </h2>
          <p className="text-xs text-neutral-600 text-center max-w-lg mx-auto">
            Our mission is to make women's fashion stylish, accessible and convenient.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D8] space-y-2">
              <Sparkles className="w-5 h-5 text-[#B38548] mx-auto" />
              <div className="font-bold text-neutral-900">Quality Fashion</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D8] space-y-2">
              <Award className="w-5 h-5 text-[#B38548] mx-auto" />
              <div className="font-bold text-neutral-900">Contemporary Designs</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D8] space-y-2">
              <ShieldCheck className="w-5 h-5 text-[#B38548] mx-auto" />
              <div className="font-bold text-neutral-900">Secure Payments</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D8] space-y-2">
              <Truck className="w-5 h-5 text-[#B38548] mx-auto" />
              <div className="font-bold text-neutral-900">Reliable Delivery</div>
            </div>
          </div>
        </div>

        {/* Our Promise Callout */}
        <div className="bg-[#FAF4EB] p-8 rounded-3xl border border-[#EFE6D8] text-center space-y-3">
          <h3 className="font-serif text-2xl font-bold text-neutral-900">Our Promise</h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            From discovering a product to receiving your order at your doorstep, we aim to make your shopping experience simple and enjoyable.
          </p>
          <p className="font-serif text-lg font-bold text-[#B38548] pt-2">
            Discover your style. Express your confidence. Be Femmeera.
          </p>
        </div>

      </div>
    </div>
  );
}
