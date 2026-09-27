export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image: string;
  content: {
    intro: string;
    sections: {
      heading: string;
      text: string;
    }[];
    conclusion: string;
  };
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'saree-guide-1',
    slug: 'how-to-choose-the-right-saree-for-different-occasions',
    title: 'How to Choose the Right Saree for Different Occasions',
    excerpt: 'A complete guide to selecting the ideal saree fabric, drape, and styling for weddings, festive celebrations, office wear, and casual outings.',
    category: 'Style Guide',
    readTime: '5 min read',
    datePublished: '2026-09-01',
    authorName: 'Femmeera Editorial Team',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    content: {
      intro: 'Sarees remain one of the most versatile and timeless garments in women\'s fashion. Selecting the right drape and weave depends on the occasion, season, and comfort requirements.',
      sections: [
        {
          heading: '1. Festive & Wedding Celebrations: Rich Silks & Heavy Borders',
          text: 'For weddings, sangeet ceremonies, and grand festivals like Diwali, opt for rich fabrics such as Banarasi silk, Kanjeevaram, or embroidered Chanderi. Pair them with statement blouses and traditional jewelry for a regal look.',
        },
        {
          heading: '2. Formal & Office Wear: Breathable Linen & Cotton Blends',
          text: 'When dressing for formal meetings or corporate work environments, lightweight cotton, linen, or raw silk sarees offer a structured, sophisticated appearance without sacrificing day-long comfort.',
        },
        {
          heading: '3. Casual Evening Gatherings: Georgette & Chiffon Drapes',
          text: 'For cocktail parties, dinner dates, or casual family get-togethers, fluid fabrics like georgette, chiffon, and organza drape effortlessly and allow easy movement.',
        },
      ],
      conclusion: 'By selecting fabric types and blouse designs tailored to the event, you can build a versatile saree wardrobe suited for every moment.',
    },
  },
  {
    id: 'co-ord-styling-2',
    slug: 'how-to-style-womens-co-ord-sets',
    title: 'How to Style Women\'s Co-ord Sets for Work & Casual Outings',
    excerpt: 'Discover effortless ways to pair matching two-piece co-ord sets with footwear and accessories for a chic, modern silhouette.',
    category: 'Western Wear Trends',
    readTime: '4 min read',
    datePublished: '2026-09-03',
    authorName: 'Femmeera Editorial Team',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    content: {
      intro: 'Co-ord sets have revolutionized modern wardrobes by offering pre-matched, cohesive outfits that take the guesswork out of daily styling.',
      sections: [
        {
          heading: '1. Tailored Blazer & Trouser Sets for Office Hours',
          text: 'Structured monochrome or subtle pastel co-ords create a crisp corporate look. Pair them with pointed-toe pumps and minimal gold hoops for an elevated aesthetic.',
        },
        {
          heading: '2. Relaxed Printed Linen Sets for Weekend Brunches',
          text: 'Flowy linen or viscose co-ords featuring tropical prints or muted beige tones are perfect for sunny day outings. Wear them with woven slides and a tote bag.',
        },
        {
          heading: '3. Mix-and-Match Flexibility',
          text: 'One of the best benefits of co-ord sets is their versatility. Wear the top with high-waisted denim jeans, or pair the trousers with a simple white ribbed crop top to create multiple looks from a single set.',
        },
      ],
      conclusion: 'Investing in high-quality co-ord sets provides endless outfit combinations with minimal effort.',
    },
  },
  {
    id: 'ethnic-vs-western-3',
    slug: 'traditional-ethnic-wear-vs-modern-western-wear',
    title: 'Traditional Ethnic Wear vs Modern Western Wear: Building a Versatile Wardrobe',
    excerpt: 'Learn how to balance handcrafted Indian ethnic wear and chic western essentials to create a functional wardrobe for all events.',
    category: 'Wardrobe Essentials',
    readTime: '6 min read',
    datePublished: '2026-09-05',
    authorName: 'Femmeera Editorial Team',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    content: {
      intro: 'A balanced wardrobe combines the heritage elegance of Indian ethnic wear with the sleek convenience of contemporary western silhouettes.',
      sections: [
        {
          heading: '1. Core Ethnic Wardrobe Staples',
          text: 'Every wardrobe benefits from versatile ethnic essentials: an elegant Anarkali suit set, a versatile Kurti for daily errands, and a classic saree for cultural celebrations.',
        },
        {
          heading: '2. Essential Western Fashion Pieces',
          text: 'Complement traditional outfits with western staples: a classic midi dress, tailored trousers, casual tops, and a coordinating two-piece set.',
        },
        {
          heading: '3. Fusion Styling Tips',
          text: 'Blend traditional and western elements by pairing a chikankari kurti with slim-fit jeans, or draping a dupatta over a sleek turtleneck top.',
        },
      ],
      conclusion: 'Embrace both worlds by choosing garments with quality craftsmanship, rich textures, and comfortable fits.',
    },
  },
];
