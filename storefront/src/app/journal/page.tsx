import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Clock, User, Sparkles } from 'lucide-react';
import { JOURNAL_ARTICLES } from '@/data/articles';
import { JsonLd } from '@/components/ui/JsonLd';

export const metadata: Metadata = {
  title: "Style Journal & Fashion Guides | Femmeera",
  description: "Read expert fashion guides on women's traditional Indian wear, saree selection, co-ord styling, and building a versatile wardrobe.",
  alternates: {
    canonical: 'https://femmeera.com/journal',
  },
  openGraph: {
    title: "Style Journal & Fashion Guides | Femmeera",
    description: "Read expert fashion guides on women's traditional Indian wear, saree selection, co-ord styling, and building a versatile wardrobe.",
    url: 'https://femmeera.com/journal',
    type: 'website',
  },
};

export default function JournalIndexPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <JsonLd
        type="BreadcrumbList"
        breadcrumbs={[
          { name: 'Home', item: 'https://femmeera.com' },
          { name: 'Journal', item: 'https://femmeera.com/journal' },
        ]}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#EFE6D8] pb-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#B38548] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FEMMEERA EDITORIAL</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-neutral-900">
            Style Journal & Fashion Guides
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">
            Thoughtful insights, styling advice, and timeless wardrobe guidance for traditional Indian ethnic wear and modern western fashion.
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {JOURNAL_ARTICLES.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-[#EFE6D8] rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <Link href={`/journal/${article.slug}`} className="block relative aspect-16/10 bg-neutral-100 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-neutral-900 rounded-lg uppercase tracking-wider">
                  {article.category}
                </span>
              </Link>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </span>
                    <span>•</span>
                    <span>{article.datePublished}</span>
                  </div>

                  <Link href={`/journal/${article.slug}`}>
                    <h2 className="font-serif text-lg font-bold text-neutral-900 line-clamp-2 group-hover:text-[#B38548] transition-colors">
                      {article.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#B38548]" />
                    <span>{article.authorName}</span>
                  </span>

                  <Link
                    href={`/journal/${article.slug}`}
                    className="text-xs font-bold text-[#B38548] hover:text-[#966C32] flex items-center gap-0.5"
                  >
                    <span>Read Guide</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
