import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft, Clock, User, Sparkles, ArrowRight } from 'lucide-react';
import { JOURNAL_ARTICLES } from '@/data/articles';
import { JsonLd } from '@/components/ui/JsonLd';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'Article Not Found | Femmeera',
      description: 'The requested fashion guide could not be found.',
    };
  }

  const title = `${article.title} | Femmeera Journal`;
  const description = article.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `https://femmeera.com/journal/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://femmeera.com/journal/${slug}`,
      type: 'article',
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  };
}

export default async function JournalDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <JsonLd
        type="Article"
        article={{
          title: article.title,
          description: article.excerpt,
          slug: article.slug,
          image: article.image,
          datePublished: article.datePublished,
          authorName: article.authorName,
        }}
      />

      <JsonLd
        type="BreadcrumbList"
        breadcrumbs={[
          { name: 'Home', item: 'https://femmeera.com' },
          { name: 'Journal', item: 'https://femmeera.com/journal' },
          { name: article.title, item: `https://femmeera.com/journal/${article.slug}` },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/journal"
          className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Style Journal</span>
        </Link>

        {/* Header */}
        <div className="space-y-4 border-b border-[#EFE6D8] pb-8">
          <div className="flex items-center space-x-3 text-xs text-neutral-500">
            <span className="px-3 py-1 bg-[#FAF3E7] text-[#B38548] font-bold text-[10px] uppercase tracking-wider rounded-lg border border-[#E8DEC8]">
              {article.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </span>
            <span>•</span>
            <span>Published {article.datePublished}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 leading-tight">
            {article.title}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>

          <div className="flex items-center space-x-2 pt-2 text-xs font-medium text-neutral-700">
            <User className="w-4 h-4 text-[#B38548]" />
            <span>Written by <strong>{article.authorName}</strong></span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-16/9 bg-neutral-100 rounded-3xl overflow-hidden border border-[#EFE6D8] shadow-sm">
          <Image src={article.image} alt={article.title} fill priority className="object-cover" />
        </div>

        {/* Main Content */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EFE6D8] space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed shadow-xs">
          <p className="font-medium text-neutral-800 text-sm sm:text-base border-l-4 border-[#B38548] pl-4 italic">
            {article.content.intro}
          </p>

          {article.content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2 pt-4">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
                {sec.heading}
              </h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {sec.text}
              </p>
            </div>
          ))}

          <div className="pt-6 border-t border-neutral-100 space-y-2">
            <h3 className="font-serif text-base font-bold text-neutral-900">Summary</h3>
            <p className="text-neutral-700">{article.content.conclusion}</p>
          </div>
        </div>

        {/* Bottom CTA Box */}
        <div className="bg-[#FAF4EB] p-8 rounded-3xl border border-[#EFE6D8] text-center space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#B38548] block">
            EXPLORE FEMMEERA COLLECTIONS
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
            Discover Traditional & Western Fashion
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mx-auto">
            Browse our curated saree, kurti, lehenga, and western dress collections crafted for elegance and comfort.
          </p>
          <div className="pt-2">
            <Link
              href="/women"
              className="inline-flex items-center justify-center px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md gap-2"
            >
              <span>Shop All Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
