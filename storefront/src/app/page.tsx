import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Heart, CheckCircle2, ShieldCheck, Truck, RotateCcw, CreditCard, Award, Sparkles } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { cmsService } from '@/services/cmsService';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PromoPopupModal } from '@/components/home/PromoPopupModal';
import { WatchAndShopSection } from '@/components/home/WatchAndShopSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { AddToCartButton } from '@/components/ui/AddToCartButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const defaultNewArrivals = [
  {
    id: 101,
    name: 'Embroidered Silk Lehenga Set',
    slug: 'embroidered-silk-lehenga-set',
    price: 14999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 102,
    name: 'Handcrafted Banarasi Silk Saree',
    slug: 'handcrafted-banarasi-silk-saree',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 103,
    name: 'Designer Anarkali Suit Set',
    slug: 'designer-anarkali-suit-set',
    price: 6499,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 104,
    name: 'Linen Blend Premium Co-ord Set',
    slug: 'linen-co-ord-set',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 105,
    name: 'Chanderi Printed Kurti Set',
    slug: 'chanderi-printed-kurti-set',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 106,
    name: 'Indo-Western Velvet Evening Gown',
    slug: 'indo-western-velvet-glen-gown',
    price: 11999,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
  },
];

const defaultTraditionalWear = [
  {
    id: 2,
    name: 'Handcrafted Banarasi Silk Saree',
    slug: 'handcrafted-banarasi-silk-saree',
    price: 8999,
    mrp: 12999,
    tag: 'PURE SILK',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 1,
    name: 'Embroidered Silk Lehenga Set',
    slug: 'embroidered-silk-lehenga-set',
    price: 14999,
    mrp: 19999,
    tag: 'BRIDAL COLLECTION',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Designer Anarkali Suit Set',
    slug: 'designer-anarkali-suit-set',
    price: 6499,
    mrp: 8999,
    tag: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Chanderi Printed Kurti Set',
    slug: 'chanderi-printed-kurti-set',
    price: 2499,
    mrp: 3499,
    tag: 'COTTON CHANDERI',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
  },
];

const defaultWesternWear = [
  {
    id: 4,
    name: 'Linen Blend Premium Co-ord Set',
    slug: 'linen-co-ord-set',
    price: 3499,
    mrp: 4999,
    tag: 'TRENDING',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 6,
    name: 'Indo-Western Velvet Evening Gown',
    slug: 'indo-western-velvet-glen-gown',
    price: 11999,
    mrp: 16999,
    tag: 'PARTYWEAR',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
  },
];

export default async function HomePage() {
  const [categoriesRes, productsRes, traditionalRes, westernRes, settingsRes] = await Promise.all([
    categoryService.getCategories().catch(() => ({ success: false, data: [] })),
    productService.getProducts({ page: 1 }).catch(() => ({ success: false, data: [] })),
    productService.getProducts({ category_slug: 'traditional-wear' }).catch(() => ({ success: false, data: [] })),
    productService.getProducts({ category_slug: 'western-wear' }).catch(() => ({ success: false, data: [] })),
    cmsService.getSettings().catch(() => ({ success: false, data: {} })),
  ]);

  const settings: Record<string, any> = settingsRes.data || {};
  const promoImage = settings.promo_banner_image || '/images/unlock_world_fashion_banner.jpg';
  const promoUrl = settings.promo_banner_url || '/women/western-wear';
  const promoStatus = settings.promo_banner_status || 'ACTIVE';

  const rawProducts = productsRes.data || [];
  const displayNewArrivals = rawProducts.length > 0 ? rawProducts.slice(0, 6) : defaultNewArrivals;

  const rawTraditional = traditionalRes.data || [];
  const displayTraditional = rawTraditional.length > 0 ? rawTraditional.slice(0, 6) : defaultTraditionalWear;

  const rawWestern = westernRes.data || [];
  const displayWestern = rawWestern.length > 0 ? rawWestern.slice(0, 6) : defaultWesternWear;

  // Dynamic Shop By Category items from CMS Settings or default fallbacks
  const defaultShopCategories = [
    {
      name: 'SAREES',
      subtitle: 'Grace in every drape',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      slug: 'traditional-wear',
    },
    {
      name: 'SUITS',
      subtitle: 'Elegance redefined',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
      slug: 'traditional-wear',
    },
    {
      name: 'LEHENGAS',
      subtitle: 'Royal celebration wear',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
      slug: 'traditional-wear',
    },
    {
      name: 'KURTIS',
      subtitle: 'Everyday traditional comfort',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
      slug: 'traditional-wear',
    },
    {
      name: 'WESTERN DRESSES',
      subtitle: 'Chic modern trends',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      slug: 'western-wear',
    },
    {
      name: 'CO-ORD SETS',
      subtitle: 'Effortless style',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
      slug: 'western-wear',
    },
  ];

  const shopCategories = Array.isArray(settings.homepage_shop_categories) && settings.homepage_shop_categories.length > 0
    ? settings.homepage_shop_categories
    : defaultShopCategories;

  // Dynamic Featured Collections Cards from CMS Settings or default fallbacks
  const defaultFeaturedCollections = [
    {
      title: 'ROYAL TRADITIONAL WEAR',
      subtitle: 'Handcrafted Sarees, Lehengas & Anarkali Suits',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      link: '/women/traditional-wear',
    },
    {
      title: 'CHIC WESTERN TRENDS',
      subtitle: 'Co-ords, Gowns, Dresses & Partywear',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      link: '/women/western-wear',
    },
    {
      title: 'FESTIVE SILKS',
      subtitle: 'Timeless Silk Sarees for Special Moments',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      link: '/women/traditional-wear',
    },
    {
      title: 'ELEGANT EVENINGWEAR',
      subtitle: 'Statement Gowns & Luxe Cocktail Outfits',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
      link: '/women/western-wear',
    },
  ];

  const featuredCollections = Array.isArray(settings.homepage_featured_collections) && settings.homepage_featured_collections.length > 0
    ? settings.homepage_featured_collections
    : defaultFeaturedCollections;

  // Testimonials matching reference image
  const testimonials = [
    {
      quote: '"The quality, the fit, the style – everything is perfect. Femmeera is my go-to brand now!"',
      name: 'Ananya R.',
      verified: 'Verified Buyer',
      rating: 5,
    },
    {
      quote: '"Beautiful collection and fast delivery. Loved the saree I ordered for the wedding!"',
      name: 'Priya S.',
      verified: 'Verified Buyer',
      rating: 5,
    },
    {
      quote: '"Trendy western wear at such affordable prices. Highly recommended!"',
      name: 'Neha K.',
      verified: 'Verified Buyer',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      <PromoPopupModal />
      
      {/* 1. 100% FULL-WIDTH AUTO-SCROLLING HERO SLIDER */}
      <HeroSlider />

      {/* 2. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight">
              NEW ARRIVALS
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Freshly launched trends &amp; handcrafted designs</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#B38548] hover:underline"
          >
            VIEW ALL →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayNewArrivals.map((item: any) => {
            const variant = item.variants?.[0];
            const price = item.price ?? (variant ? variant.price : 1999);
            const imgUrl = item.image || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop';
            const productSlug = item.slug || 'silk-lehenga';

            return (
              <Link key={item.id} href={`/product/${productSlug}`} className="group bg-white rounded-2xl border border-[#EFE6D8] overflow-hidden shadow-2xs hover:shadow-md transition-all block">
                <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-neutral-900 text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    NEW
                  </span>
                  <button className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#B38548] rounded-full shadow-xs transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-xs text-neutral-900 font-medium line-clamp-1 group-hover:text-[#B38548] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE6D8]/60">
                    <p className="font-sans font-bold text-xs text-neutral-900">
                      ₹{Number(price).toLocaleString('en-IN')}
                    </p>
                    <AddToCartButton variantId={variant?.id || item.id} compact />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY - Reference Circular Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 text-center pt-2">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight">
            SHOP BY CATEGORY
          </h2>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="h-px bg-[#C59B58] w-8"></span>
            <span className="text-[#B38548] text-xs">🪷</span>
            <span className="h-px bg-[#C59B58] w-8"></span>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-6 gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory px-4 -mx-4 sm:px-0 sm:mx-0">
          {shopCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/women/${cat.slug}`}
              className="group flex flex-col items-center space-y-3 shrink-0 snap-center w-28 sm:w-auto"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#EFE6D8] group-hover:border-[#B38548] transition-all shadow-xs group-hover:shadow-md">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="text-center">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-neutral-900 group-hover:text-[#B38548] transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight">
            FEATURED COLLECTIONS
          </h2>
        </div>

        <div className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory px-4 -mx-4 sm:px-0 sm:mx-0">
          {featuredCollections.map((col, idx) => (
            <div key={idx} className="relative h-72 sm:h-80 rounded-2xl overflow-hidden group shadow-xs shrink-0 snap-center w-72 sm:w-auto">
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="font-sans font-bold text-sm tracking-wider uppercase mb-1">
                  {col.title}
                </h3>
                <p className="text-[11px] text-neutral-200 line-clamp-2 mb-4 font-normal">
                  {col.subtitle}
                </p>
                <div>
                  <Link
                    href={col.link}
                    className="inline-block px-4 py-2 bg-white text-neutral-900 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-[#B38548] hover:text-white transition-colors"
                  >
                    EXPLORE
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TRADITIONAL WEAR COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#B38548]">🪷</span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#B38548] uppercase">ROYAL ELEGANCE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight mt-1">
              TRADITIONAL WEAR COLLECTION
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Sarees, Lehengas, Anarkalis & Handcrafted Kurtis</p>
          </div>
          <Link
            href="/women/traditional-wear"
            className="text-xs font-bold uppercase tracking-wider text-[#B38548] hover:underline shrink-0"
          >
            EXPLORE TRADITIONAL →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayTraditional.map((item: any) => {
            const variant = item.variants?.[0];
            const price = item.price ?? (variant ? variant.price : 4999);
            const mrp = item.mrp ?? (variant ? variant.mrp : price * 1.3);
            const imgUrl = item.image || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop';
            const productSlug = item.slug || 'handcrafted-saree';

            return (
              <Link key={item.id} href={`/product/${productSlug}`} className="group bg-white rounded-2xl border border-[#EFE6D8] overflow-hidden shadow-2xs hover:shadow-md transition-all block">
                <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.tag && (
                    <span className="absolute top-2 left-2 bg-[#B38548] text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.tag}
                    </span>
                  )}
                  <button className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#B38548] rounded-full shadow-xs transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-xs text-neutral-900 font-medium line-clamp-1 group-hover:text-[#B38548] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE6D8]/60">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-sans font-bold text-xs text-neutral-900">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {mrp && mrp > price && (
                        <span className="font-sans text-[10px] text-neutral-400 line-through">
                          ₹{Number(mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <AddToCartButton variantId={variant?.id || item.id} compact />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROMOTIONAL FASHION BANNER (DYNAMIC & CLICKABLE) */}
      {promoStatus === 'ACTIVE' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
          <Link href={promoUrl} className="block group">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#E8DEC8]">
              <div className="relative w-full aspect-[21/7] sm:aspect-[24/7]">
                <Image
                  src={promoImage}
                  alt="Unlock the world of fashion - Your retail destination, just a click away!"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                  priority
                />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 6. WESTERN WEAR COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B38548]" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#B38548] uppercase">MODERN TRENDS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight mt-1">
              WESTERN WEAR COLLECTION
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Co-ords, Gowns, Summer Dresses & Partywear</p>
          </div>
          <Link
            href="/women/western-wear"
            className="text-xs font-bold uppercase tracking-wider text-[#B38548] hover:underline shrink-0"
          >
            EXPLORE WESTERN →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayWestern.map((item: any) => {
            const variant = item.variants?.[0];
            const price = item.price ?? (variant ? variant.price : 3499);
            const mrp = item.mrp ?? (variant ? variant.mrp : price * 1.3);
            const imgUrl = item.image || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
            const productSlug = item.slug || 'western-dress';

            return (
              <Link key={item.id} href={`/product/${productSlug}`} className="group bg-white rounded-2xl border border-[#EFE6D8] overflow-hidden shadow-2xs hover:shadow-md transition-all block">
                <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.tag && (
                    <span className="absolute top-2 left-2 bg-neutral-900 text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.tag}
                    </span>
                  )}
                  <button className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#B38548] rounded-full shadow-xs transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-xs text-neutral-900 font-medium line-clamp-1 group-hover:text-[#B38548] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE6D8]/60">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-sans font-bold text-xs text-neutral-900">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {mrp && mrp > price && (
                        <span className="font-sans text-[10px] text-neutral-400 line-through">
                          ₹{Number(mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <AddToCartButton variantId={variant?.id || item.id} compact />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 7. WHY CHOOSE FEMMEERA? - Reference Trust Badges */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="bg-[#FAF4EB] border border-[#EFE6D8] rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="font-serif text-sm sm:text-lg md:text-xl text-neutral-900 font-medium tracking-tight">
              WHY CHOOSE FEMMEERA?
            </h3>
          </div>

          <div className="grid grid-cols-5 gap-1 sm:gap-4 md:gap-6 text-center">
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <Award className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">PREMIUM QUALITY</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Finest fabrics &amp; craftsmanship</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">SECURE PAYMENT</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">100% safe transactions</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">EASY RETURNS</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Hassle-free within 7 days</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">FAST DELIVERY</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Dispatched in 24-48 hrs</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">COD AVAILABLE</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Pay cash on delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WATCH AND SHOP REELS SECTION */}
      <WatchAndShopSection />

      {/* 9. CUSTOMER TESTIMONIALS */}
      <TestimonialsSection />
    </div>
  );
}
