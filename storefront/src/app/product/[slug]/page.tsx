'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Ruler
} from 'lucide-react';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { Product, ProductVariant } from '@/types';
import { ProductGrid } from '@/components/ui/ProductGrid';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'size_fit' | 'shipping'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [hoveredColorImage, setHoveredColorImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    productService.getProducts({ page: 1 }).then((catRes) => {
      if (catRes.success && catRes.data) {
        const filtered = catRes.data.filter((p) => p.slug !== slug);
        setRelatedProducts(filtered.slice(0, 4));
      }
    });
    setLoading(true);
    productService.getProductBySlug(slug).then(async (res) => {
      setLoading(false);
      if (res.success && res.data) {
        setProduct(res.data);
        const defaultVar = res.data.variants?.[0] || null;
        setSelectedVariant(defaultVar);
        const mainImg = res.data.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';
        setSelectedImage(mainImg);
        setIsWishlisted(wishlistService.isInWishlist(res.data.id));
      } else {
        const catalogRes = await productService.getProducts({ page: 1, search: slug.replace(/-/g, ' ') });
        const allProductsRes = catalogRes.data?.length ? catalogRes : await productService.getProducts({ page: 1 });
        
        const matchedProd = allProductsRes.data?.find((p: any) => 
          p.slug === slug || 
          String(p.id) === String(slug) || 
          p.slug?.includes(slug) || 
          slug.includes(p.slug) ||
          p.name?.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase())
        ) || allProductsRes.data?.[0];

        if (matchedProd) {
          setProduct(matchedProd);
          setSelectedVariant(matchedProd.variants?.[0] || null);
          const mainImg = matchedProd.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop';
          setSelectedImage(mainImg);
          setIsWishlisted(wishlistService.isInWishlist(matchedProd.id));
        }
      }
    }).catch(() => {
      setLoading(false);
    });
  }, [slug]);

  // Color options derived from product variants or default, enriched with image & price info
  const colorOptions = React.useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      const defaultImg = product?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';
      return [{ name: 'Standard', code: '#B38548', image: defaultImg, price: Number(product?.price || 2199), mrp: Number(product?.mrp || 2999) }];
    }

    const colorMap = new Map<string, { code: string; image: string; price: number; mrp: number }>();

    product.variants.forEach((v) => {
      if (v.color && !colorMap.has(v.color)) {
        const hex = v.color_code || (
          v.color.toLowerCase() === 'beige' ? '#E6D7C3' :
          v.color.toLowerCase() === 'black' ? '#222222' :
          v.color.toLowerCase() === 'white' ? '#FFFFFF' :
          v.color.toLowerCase() === 'peach' ? '#FFDAB9' :
          v.color.toLowerCase() === 'ruby red' || v.color.toLowerCase() === 'red' ? '#E0115F' :
          v.color.toLowerCase() === 'royal blue' || v.color.toLowerCase() === 'blue' ? '#002366' :
          '#B38548'
        );

        // Find specific image tagged with this color_name
        const colorImgObj = product.images?.find((img) => img.color_name?.toLowerCase() === v.color.toLowerCase());
        const colorImg = colorImgObj?.image_url 
          || product.images?.[colorMap.size]?.image_url 
          || product.images?.[0]?.image_url 
          || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';

        colorMap.set(v.color, {
          code: hex,
          image: colorImg,
          price: Number(v.price || product.price || 2199),
          mrp: Number(v.mrp || product.mrp || 2999)
        });
      }
    });

    return Array.from(colorMap.entries()).map(([name, data]) => ({ name, ...data }));
  }, [product?.variants, product?.images, product?.price, product?.mrp]);

  // Initial color setup on product load
  useEffect(() => {
    if (colorOptions.length > 0 && (!selectedColor || !colorOptions.some(c => c.name === selectedColor))) {
      setSelectedColor(colorOptions[0].name);
    }
  }, [colorOptions]);

  // Color-specific image gallery (filters to ONLY images matching selectedColor)
  const colorSpecificImages = React.useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      ];
    }
    const matching = product.images.filter((img) => img.color_name?.toLowerCase() === selectedColor.toLowerCase());
    if (matching.length > 0) {
      return matching.map((img) => img.image_url);
    }
    return product.images.map((img) => img.image_url);
  }, [product?.images, selectedColor]);

  // Sync main stage image when color changes
  useEffect(() => {
    if (colorSpecificImages.length > 0) {
      setSelectedImage(colorSpecificImages[0]);
    }
  }, [colorSpecificImages]);

  // Sizes available for the selected color
  const availableSizes = React.useMemo(() => {
    if (!product?.variants) return ['M'];
    const matchingVars = product.variants.filter((v) => v.color === selectedColor);
    if (matchingVars.length === 0) {
      return Array.from(new Set(product.variants.map((v) => v.size)));
    }
    return Array.from(new Set(matchingVars.map((v) => v.size)));
  }, [product?.variants, selectedColor]);

  // Initial size setup
  useEffect(() => {
    if (availableSizes.length > 0 && (!selectedSize || !availableSizes.includes(selectedSize))) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes]);

  // Selected variant matching Color + Size
  const activeVariant = React.useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
      product.variants.find((v) => v.color === selectedColor) ||
      product.variants[0]
    );
  }, [product?.variants, selectedColor, selectedSize]);

  const price = Number(activeVariant?.price || product?.variants?.[0]?.price || product?.price || 2199);
  const mrp = Number(activeVariant?.mrp || product?.variants?.[0]?.mrp || product?.mrp || 2999);
  const isOutOfStock = activeVariant ? activeVariant.stock <= 0 : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B38548] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-neutral-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-20 px-4 text-center">
        <h1 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Product Not Found</h1>
        <p className="text-xs text-neutral-500 mb-6">The requested product does not exist or has been moved.</p>
        <Link href="/shop" className="px-6 py-2.5 bg-[#B38548] text-white text-xs font-bold rounded-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!activeVariant?.id) return;
    if (isOutOfStock) {
      alert('Sorry, this variant is currently out of stock.');
      return;
    }

    const res = await cartService.addItem(activeVariant.id, 1);
    if (res.success) {
      window.dispatchEvent(new Event('femmeera-cart-updated'));
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    } else {
      alert(res.message || 'Failed to add item to bag.');
    }
  };

  const handleBuyNow = async () => {
    if (!activeVariant?.id) return;
    if (isOutOfStock) {
      alert('Sorry, this variant is currently out of stock.');
      return;
    }

    try {
      const currentCart = await cartService.getCart();
      if (currentCart.success && currentCart.data?.items?.length) {
        for (const item of currentCart.data.items) {
          await cartService.removeItem(item.cart_item_id);
        }
      }
    } catch {
      // Ignore clear error
    }

    const res = await cartService.addItem(activeVariant.id, 1);
    if (res.success) {
      window.dispatchEvent(new Event('femmeera-cart-updated'));
      router.push('/checkout');
    } else {
      alert(res.message || 'Failed to process Buy Now.');
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareData = {
      title: product?.name || 'Femmeera Product',
      text: `Check out ${product?.name || 'this product'} on Femmeera!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignored if user cancels share sheet
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 3000);
      } catch (err) {
        alert('Product link copied to clipboard!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-[11px] text-neutral-500 flex items-center space-x-2">
          <Link href="/" className="hover:text-[#B38548]">Home</Link>
          <span>/</span>
          <Link href="/women" className="hover:text-[#B38548]">Western Wear</Link>
          <span>/</span>
          <Link href="/women/western-wear" className="hover:text-[#B38548]">Dresses</Link>
          <span>/</span>
          <span className="font-semibold text-neutral-900">{product.name}</span>
        </nav>

        {/* Product Viewer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Gallery Column: Vertical Thumbnails + Main Stage */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Vertical Thumbnails (Showing only photos for selected color) */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0">
              {colorSpecificImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-[#B38548] ring-2 ring-[#B38548]/20' : 'border-[#EFE6D8] opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${product.name} thumbnail`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="relative flex-1 aspect-3/4 sm:aspect-4/5 bg-white rounded-3xl overflow-hidden border border-[#EFE6D8] shadow-xs group">
              <Image src={hoveredColorImage || selectedImage || colorSpecificImages[0]} alt={product.name} fill priority className="object-cover transition-all duration-300" />

              <span className="absolute top-4 left-4 bg-neutral-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                NEW
              </span>

              <button
                onClick={() => {
                  const res = wishlistService.toggleWishlist(product);
                  setIsWishlisted(res.isWishlisted);
                }}
                className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-rose-600 rounded-full shadow-sm transition-all"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>
            </div>

          </div>

          {/* Right Options Column */}
          <div className="lg:col-span-5 space-y-6">
            
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center space-x-3 mt-2 text-xs text-neutral-600">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-bold text-neutral-900 ml-1">4.7</span>
                  <span className="text-neutral-400 ml-1">(128 Reviews)</span>
                </div>
                <span>|</span>
                <span className="text-[#B38548] font-semibold">56 Sold this week</span>
              </div>
            </div>

            {/* Price & Offer Box */}
            <div className="space-y-3">
              <div className="flex items-baseline space-x-3">
                <span className="font-sans font-extrabold text-2xl text-neutral-900">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {mrp > price && (
                  <span className="text-sm text-neutral-400 line-through">
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-neutral-400">Inclusive of all taxes</span>
              </div>

              {/* Prepaid Offer Callout */}
              <div className="bg-[#FAF3E7] border border-[#E8DEC8] rounded-xl p-3 flex items-center space-x-2 text-xs text-[#7A6240]">
                <Sparkles className="w-4 h-4 text-[#B38548] shrink-0" />
                <span>Get it for <strong>₹{Math.round(price * 0.9).toLocaleString('en-IN')}</strong> with 10% Off On Prepaid Orders</span>
              </div>
            </div>

            {/* Color Selection Cards (Amazon Style with product photo & price) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 block uppercase tracking-wider">
                  Colour: <span className="text-[#B38548] font-extrabold">{selectedColor}</span>
                </label>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {colorOptions.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        setSelectedImage(c.image);
                        setHoveredColorImage(null);
                      }}
                      onMouseEnter={() => setHoveredColorImage(c.image)}
                      onMouseLeave={() => setHoveredColorImage(null)}
                      className={`relative shrink-0 w-24 sm:w-28 flex flex-col items-center bg-white rounded-2xl p-2 border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#B38548] ring-2 ring-[#B38548]/30 shadow-md scale-105'
                          : 'border-[#EFE6D8] hover:border-[#B38548]/60 hover:shadow-xs'
                      }`}
                    >
                      {/* Color Preview Image Box */}
                      <div className="relative w-full aspect-3/4 bg-neutral-100 rounded-xl overflow-hidden mb-2 border border-neutral-100">
                        <Image
                          src={c.image}
                          alt={`${product.name} - ${c.name}`}
                          fill
                          className="object-cover"
                        />
                        {/* Color Swatch Dot Badge */}
                        <span
                          className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: c.code }}
                          title={c.name}
                        />
                      </div>

                      {/* Color Name Label */}
                      <span className="text-[11px] font-bold text-neutral-800 truncate w-full text-center mb-0.5">
                        {c.name}
                      </span>

                      {/* Color Price & MRP */}
                      <div className="flex flex-col items-center leading-tight">
                        <span className="text-xs font-extrabold text-neutral-900">
                          ₹{c.price.toLocaleString('en-IN')}
                        </span>
                        {c.mrp > c.price && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            ₹{c.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-neutral-900">
                  SIZE: {selectedSize && <span className="text-[#B38548] font-bold">{selectedSize}</span>}
                </label>
                <button className="text-[#B38548] hover:underline font-semibold flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {availableSizes.map((s) => {
                  const matchingVar = product.variants?.find((v) => v.color === selectedColor && v.size === s);
                  const isSelected = selectedSize === s;
                  const varOutOfStock = matchingVar ? matchingVar.stock <= 0 : false;

                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`relative py-2.5 text-xs font-bold rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#B38548] bg-[#FAF3E7] text-[#B38548] shadow-xs'
                          : varOutOfStock
                          ? 'border-neutral-200 bg-neutral-100 text-neutral-400 opacity-70 line-through'
                          : 'border-[#EFE6D8] bg-white text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {isOutOfStock && (
                <p className="text-xs font-bold text-rose-600 pt-1">
                  ⚠️ This Color ({selectedColor}) and Size ({selectedSize}) combination is currently Out of Stock.
                </p>
              )}
            </div>

            {/* Delivery Estimate Box */}
            <div className="bg-white border border-[#EFE6D8] rounded-2xl p-4 space-y-2 text-xs text-neutral-600">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#B38548]" />
                <span>Estimated Delivery: <strong>24 - 26 May | Free Delivery</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-[#B38548]" />
                <span>7-day return & exchange policy</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#B38548]" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-3.5 px-4 font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                    isOutOfStock
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                      : 'bg-[#B38548] hover:bg-[#966C32] text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`py-3.5 px-4 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${
                    isOutOfStock
                      ? 'bg-neutral-100 border border-neutral-300 text-neutral-400 cursor-not-allowed'
                      : 'bg-white border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  BUY NOW
                </button>
              </div>

              <div className="flex justify-center space-x-6 text-xs text-neutral-500 pt-2">
                <button
                  onClick={() => {
                    const res = wishlistService.toggleWishlist(product);
                    setIsWishlisted(res.isWishlisted);
                  }}
                  className={`flex items-center space-x-1 hover:text-neutral-900 transition-colors ${
                    isWishlisted ? 'text-rose-600 font-bold' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 hover:text-neutral-900 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-neutral-700" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {addedToast && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Added to your bag successfully! Header bag count updated.</span>
              </div>
            )}

            {shareToast && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Product link copied to clipboard!</span>
              </div>
            )}

          </div>

        </div>

        {/* Tabbed Information & Why You'll Love It Section */}
        <div className="border-t border-[#EFE6D8] pt-10 space-y-8">
          
          <div className="flex border-b border-[#EFE6D8] space-x-8 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 border-b-2 transition-all ${activeTab === 'description' ? 'border-[#B38548] text-[#B38548]' : 'border-transparent hover:text-neutral-800'}`}
            >
              DESCRIPTION
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 border-b-2 transition-all ${activeTab === 'details' ? 'border-[#B38548] text-[#B38548]' : 'border-transparent hover:text-neutral-800'}`}
            >
              DETAILS
            </button>
            <button
              onClick={() => setActiveTab('size_fit')}
              className={`pb-3 border-b-2 transition-all ${activeTab === 'size_fit' ? 'border-[#B38548] text-[#B38548]' : 'border-transparent hover:text-neutral-800'}`}
            >
              SIZE & FIT
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 border-b-2 transition-all ${activeTab === 'shipping' ? 'border-[#B38548] text-[#B38548]' : 'border-transparent hover:text-neutral-800'}`}
            >
              SHIPPING & RETURNS
            </button>
          </div>

          {/* Dynamic Tab Content Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-neutral-700 leading-relaxed">
            <div>
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <p>
                    {product.description || `Elevate your wardrobe with our signature ${product.name}. Crafted from premium breathable fabrics for superior comfort, exquisite drape, and timeless elegance.`}
                  </p>
                  <ul className="space-y-2 list-disc list-inside font-medium text-neutral-800">
                    <li>Authentic Femmeera Craftsmanship & Tailoring</li>
                    <li>Lightweight & Breathable Fabric Texture</li>
                    <li>Designed for Celebrations, Festive & Casual Wear</li>
                    <li>Durable Stitching & Intricate Border Finish</li>
                  </ul>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-[#EFE6D8] rounded-2xl text-xs">
                    <span className="font-bold text-neutral-400 uppercase text-[10px]">Product Code / SKU</span>
                    <span className="font-bold text-neutral-900">{product.sku || 'FEM-2026-COUTURE'}</span>

                    <span className="font-bold text-neutral-400 uppercase text-[10px]">Brand / Collection</span>
                    <span className="font-bold text-neutral-900">{product.brand || 'Femmeera Studio'}</span>

                    <span className="font-bold text-neutral-400 uppercase text-[10px]">Category</span>
                    <span className="font-bold text-neutral-900">{product.category?.name || 'Women Couture'}</span>

                    <span className="font-bold text-neutral-400 uppercase text-[10px]">Material & Care</span>
                    <span className="font-bold text-neutral-900">Dry Clean Only</span>

                    <span className="font-bold text-neutral-400 uppercase text-[10px]">Country of Origin</span>
                    <span className="font-bold text-neutral-900">India</span>
                  </div>
                </div>
              )}

              {activeTab === 'size_fit' && (
                <div className="space-y-3">
                  <p className="font-semibold text-neutral-800">
                    Fit Type: <span className="font-bold text-neutral-900">Regular Fit (True to Size)</span>
                  </p>
                  <p className="text-neutral-500">
                    Model measurements: Model is 5&apos;8&quot; tall and is wearing size S.
                  </p>
                  <div className="p-3 bg-white border border-[#EFE6D8] rounded-2xl space-y-2">
                    <span className="font-bold text-neutral-900 text-[11px] block">Size Chart Guide (Inches)</span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className="bg-neutral-100 p-1.5 rounded">S: Bust 34&quot;</div>
                      <div className="bg-neutral-100 p-1.5 rounded">M: Bust 36&quot;</div>
                      <div className="bg-neutral-100 p-1.5 rounded">L: Bust 38&quot;</div>
                      <div className="bg-neutral-100 p-1.5 rounded">XL: Bust 40&quot;</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-white border border-[#EFE6D8] rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-neutral-900 font-bold">
                      <Truck className="w-4 h-4 text-[#B38548]" />
                      <span>Dispatch & Delivery Timeline</span>
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      Orders are dispatched within 24 to 48 hours. Standard domestic delivery takes 2 - 5 business days. Free shipping on orders above ₹1,499.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFE6D8] rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-neutral-900 font-bold">
                      <RotateCcw className="w-4 h-4 text-[#B38548]" />
                      <span>Easy Returns & Exchanges</span>
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      Hassle-free 7-day return and exchange policy from date of delivery. Items must be unused with original tags intact.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Why You'll Love It Highlight List */}
            <div className="bg-[#FAF4EB] p-6 rounded-3xl border border-[#EFE6D8] space-y-3 h-fit">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 mb-2">WHY YOU&apos;LL LOVE IT</h4>
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-[#B38548] shrink-0" />
                  <span className="font-medium text-neutral-800">Breathable & Premium Fabric Texture</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B38548] shrink-0" />
                  <span className="font-medium text-neutral-800">Effortless Fashion Statement</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B38548] shrink-0" />
                  <span className="font-medium text-neutral-800">Perfect Fit & Handcrafted Finish</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#B38548] shrink-0" />
                  <span className="font-medium text-neutral-800">100% Quality Inspected</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#EFE6D8] pt-12 space-y-6">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B38548] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B38548]" />
                YOU MAY ALSO LIKE
              </span>
              <h2 className="font-serif text-2xl font-medium text-neutral-900 tracking-tight">
                Related Products
              </h2>
            </div>

            <ProductGrid products={relatedProducts} />
          </div>
        )}

      </div>
    </div>
  );
}
