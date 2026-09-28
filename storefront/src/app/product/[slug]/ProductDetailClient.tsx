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

interface ProductDetailClientProps {
  initialProduct?: Product | null;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || initialProduct?.slug || '';

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(initialProduct?.variants?.[0] || null);
  const [selectedImage, setSelectedImage] = useState<string>(initialProduct?.images?.[0]?.image_url || '');
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'size_fit' | 'shipping'>('description');
  const [isWishlisted, setIsWishlisted] = useState(initialProduct ? wishlistService.isInWishlist(initialProduct.id) : false);
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

    if (!initialProduct) {
      setLoading(true);
      productService.getProductBySlug(slug).then(async (res) => {
        setLoading(false);
        if (res.success && res.data) {
          setProduct(res.data);
          const defaultVar = res.data.variants?.[0] || null;
          setSelectedVariant(defaultVar);
          const mainImg = res.data.images?.[0]?.image_url || '';
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
            const mainImg = matchedProd.images?.[0]?.image_url || '';
            setSelectedImage(mainImg);
            setIsWishlisted(wishlistService.isInWishlist(matchedProd.id));
          }
        }
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [slug, initialProduct]);

  // Color options derived from product variants & images
  const colorOptions = React.useMemo(() => {
    const allColorNames = new Set<string>();

    if (product?.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.color) allColorNames.add(v.color.trim());
      });
    }

    if (product?.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img.color_name) allColorNames.add(img.color_name.trim());
      });
    }

    if (allColorNames.size === 0) {
      const defaultImg = product?.images?.[0]?.image_url || '';
      return [{ name: 'Standard', code: '#B38548', image: defaultImg, price: Number(product?.price || 2199), mrp: Number(product?.mrp || 2999) }];
    }

    const colorList: { name: string; code: string; image: string; price: number; mrp: number }[] = [];

    Array.from(allColorNames).forEach((colorName) => {
      const cleanColor = colorName.trim().toLowerCase();

      const matchingVariant = product?.variants?.find((v) => v.color && v.color.trim().toLowerCase() === cleanColor);

      const hex = matchingVariant?.color_code || (
        cleanColor === 'beige' ? '#E6D7C3' :
        cleanColor === 'black' ? '#222222' :
        cleanColor === 'white' || cleanColor === 'ivory white' ? '#FFFFFF' :
        cleanColor === 'peach' ? '#FFDAB9' :
        cleanColor === 'pink' || cleanColor === 'blush pink' ? '#FFC0CB' :
        cleanColor === 'mauve pink' || cleanColor === 'mauve' ? '#E0B0FF' :
        cleanColor === 'ruby red' || cleanColor === 'red' || cleanColor === 'maroon' ? '#E0115F' :
        cleanColor === 'royal blue' || cleanColor === 'blue' || cleanColor === 'navy blue' ? '#002366' :
        cleanColor === 'green' || cleanColor === 'emerald' || cleanColor === 'emerald green' ? '#50C878' :
        cleanColor === 'yellow' || cleanColor === 'mustard' || cleanColor === 'mustard yellow' ? '#FFDB58' :
        cleanColor === 'purple' || cleanColor === 'lavender' ? '#E6E6FA' :
        cleanColor === 'gold' ? '#D4AF37' :
        '#B38548'
      );

      // 1. Primary image tagged with this exact color
      let colorImg = product?.images?.find((img) => 
        img.color_name && img.color_name.trim().toLowerCase() === cleanColor && img.is_primary
      )?.image_url;

      // 2. Any image tagged with this exact color
      if (!colorImg && product?.images) {
        colorImg = product.images.find((img) => 
          img.color_name && img.color_name.trim().toLowerCase() === cleanColor
        )?.image_url;
      }

      // 3. Any image tagged containing this color string
      if (!colorImg && product?.images) {
        colorImg = product.images.find((img) => {
          if (!img.color_name) return false;
          const tag = img.color_name.trim().toLowerCase();
          return tag.includes(cleanColor) || cleanColor.includes(tag);
        })?.image_url;
      }

      // 4. Image URL containing color name
      if (!colorImg && product?.images) {
        colorImg = product.images.find((img) => 
          img.image_url && img.image_url.toLowerCase().includes(cleanColor)
        )?.image_url;
      }

      // 5. Fallback: untagged image or primary image, BUT never force an image tagged with a different color
      if (!colorImg && product?.images && product.images.length > 0) {
        const untaggedImg = product.images.find((img) => !img.color_name || !img.color_name.trim())?.image_url;
        colorImg = untaggedImg || product.images[0]?.image_url;
      }

      const price = Number(matchingVariant?.price || product?.price || 2199);
      const mrp = Number(matchingVariant?.mrp || product?.mrp || 2999);

      colorList.push({
        name: colorName,
        code: hex,
        image: colorImg || '',
        price,
        mrp,
      });
    });

    return colorList;
  }, [product?.variants, product?.images, product?.price, product?.mrp]);

  useEffect(() => {
    if (colorOptions.length > 0) {
      const defaultVariantColor = product?.variants?.[0]?.color?.trim();
      const variantMatch = defaultVariantColor && colorOptions.find(c => c.name.trim().toLowerCase() === defaultVariantColor.toLowerCase());

      if (!selectedColor || !colorOptions.some(c => c.name.trim().toLowerCase() === selectedColor.trim().toLowerCase())) {
        setSelectedColor(variantMatch ? variantMatch.name : colorOptions[0].name);
      }
    }
  }, [colorOptions, product?.variants]);

  const colorSpecificImages = React.useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return [];
    }
    const cleanSelected = (selectedColor || '').trim().toLowerCase();
    if (!cleanSelected) {
      return product.images.map((img) => img.image_url);
    }

    // 1. Direct tag matches (case-insensitive, trimmed)
    const exactMatches = product.images.filter((img) => 
      img.color_name && img.color_name.trim().toLowerCase() === cleanSelected
    );

    // 2. Loose tag match
    const looseMatches = product.images.filter((img) => {
      if (!img.color_name) return false;
      const tag = img.color_name.trim().toLowerCase();
      return tag === cleanSelected || tag.includes(cleanSelected) || cleanSelected.includes(tag);
    });

    // 3. URL string matches
    const urlMatches = product.images.filter((img) => 
      img.image_url && img.image_url.toLowerCase().includes(cleanSelected)
    );

    const matched = exactMatches.length > 0 ? exactMatches : (looseMatches.length > 0 ? looseMatches : urlMatches);

    // Untagged general photos visible across all colors
    const untaggedImages = product.images.filter((img) => !img.color_name || !img.color_name.trim());

    if (matched.length > 0) {
      const combined = [...matched, ...untaggedImages];
      const uniqueUrls = Array.from(new Set(combined.map((img) => img.image_url)));
      return uniqueUrls;
    }

    if (untaggedImages.length > 0) {
      return untaggedImages.map((img) => img.image_url);
    }

    return product.images.map((img) => img.image_url);
  }, [product?.images, selectedColor]);

  const displayImages = React.useMemo(() => {
    if (!product?.images || product.images.length === 0) return [];

    if (colorSpecificImages.length > 0) {
      return colorSpecificImages;
    }

    return product.images.map((img) => img.image_url);
  }, [product?.images, colorSpecificImages]);

  useEffect(() => {
    if (selectedColor && colorOptions.length > 0) {
      const activeCard = colorOptions.find((c) => c.name.trim().toLowerCase() === selectedColor.trim().toLowerCase());
      if (activeCard?.image && displayImages.includes(activeCard.image)) {
        setSelectedImage(activeCard.image);
      } else if (displayImages.length > 0) {
        setSelectedImage(displayImages[0]);
      }
    }
  }, [selectedColor, colorOptions, displayImages]);

  const availableSizes = React.useMemo(() => {
    if (!product?.variants) return ['M'];
    const matchingVars = product.variants.filter((v) => v.color === selectedColor);
    if (matchingVars.length === 0) {
      return Array.from(new Set(product.variants.map((v) => v.size)));
    }
    return Array.from(new Set(matchingVars.map((v) => v.size)));
  }, [product?.variants, selectedColor]);

  useEffect(() => {
    if (availableSizes.length > 0 && (!selectedSize || !availableSizes.includes(selectedSize))) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes]);

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
      // Ignore
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
        // Ignored
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
    <div className="min-h-screen bg-[#FDFBF7] py-4 px-3 sm:px-6 lg:px-8 space-y-8 pb-24 sm:pb-12">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-[11px] text-neutral-500 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <Link href="/" className="hover:text-[#B38548]">Home</Link>
          <span>/</span>
          <Link href="/women" className="hover:text-[#B38548]">Women</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link href={`/women/${product.category.slug}`} className="hover:text-[#B38548]">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-semibold text-neutral-900">{product.name}</span>
        </nav>

        {/* Product Viewer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
            <div className="relative w-full order-1 sm:order-2 flex-1 aspect-3/4 sm:aspect-4/5 bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EFE6D8] shadow-xs group">
              <Image src={hoveredColorImage || selectedImage || displayImages[0]} alt={`${product.name} - ${selectedColor || 'Main View'}`} fill priority className="object-cover transition-all duration-300" />

              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-neutral-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                NEW
              </span>

              <button
                onClick={() => {
                  const res = wishlistService.toggleWishlist(product);
                  setIsWishlisted(res.isWishlisted);
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-rose-600 rounded-full shadow-sm transition-all"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>
            </div>

            <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 w-full sm:w-auto max-h-none sm:max-h-[580px] py-1 px-0.5 scrollbar-thin">
              {displayImages.map((img, idx) => {
                const isSelected = (selectedImage || displayImages[0]) === img;
                const isColorMatched = colorSpecificImages.includes(img);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    onMouseEnter={() => setSelectedImage(img)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-26 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-100 shadow-2xs ${
                      isSelected
                        ? 'border-[#B38548] ring-2 ring-[#B38548]/30 scale-102 shadow-sm'
                        : isColorMatched
                        ? 'border-neutral-300 opacity-90 hover:opacity-100 hover:border-neutral-500'
                        : 'border-[#EFE6D8] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} detail view ${idx + 1}`} fill className="object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight">
                {product.name}
              </h1>

              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center space-x-3 mt-2 text-xs text-neutral-600">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-bold text-neutral-900 ml-1">{product.rating.toFixed(1)}</span>
                    <span className="text-neutral-400 ml-1">({product.review_count || 0} Reviews)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 border-b border-neutral-200 pb-4">
              <div className="flex items-baseline space-x-2">
                {mrp > price && (
                  <span className="text-rose-600 font-extrabold text-xl sm:text-2xl">
                    -{Math.round(((mrp - price) / mrp) * 100)}%
                  </span>
                )}
                <span className="font-sans font-black text-2xl sm:text-3xl text-neutral-900">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </div>

              {mrp > price && (
                <div className="text-xs text-neutral-500 font-medium">
                  M.R.P.: <span className="line-through text-neutral-400">₹{mrp.toLocaleString('en-IN')}</span>
                </div>
              )}

              <p className="text-xs font-semibold text-neutral-700">Inclusive of all taxes</p>

              <div className="bg-[#FAF3E7] border border-[#E8DEC8] rounded-xl p-3 flex items-center space-x-2 text-xs text-[#7A6240] mt-2">
                <Sparkles className="w-4 h-4 text-[#B38548] shrink-0" />
                <span>Get it for <strong>₹{Math.round(price * 0.9).toLocaleString('en-IN')}</strong> with 10% Off On Prepaid Orders</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 block uppercase tracking-wider">
                  Colour: <span className="text-neutral-900 font-extrabold">{selectedColor}</span>
                </label>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {colorOptions.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        if (c.image) setSelectedImage(c.image);
                        setHoveredColorImage(null);
                      }}
                      onMouseEnter={() => {
                        if (c.image) setHoveredColorImage(c.image);
                      }}
                      onMouseLeave={() => setHoveredColorImage(null)}
                      className={`relative shrink-0 w-20 sm:w-24 flex flex-col items-center bg-white rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-sm'
                          : 'border-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      <div className="relative w-full aspect-3/4 bg-neutral-100 overflow-hidden">
                        {c.image ? (
                          <Image
                            src={c.image}
                            alt={`${product.name} in ${c.name}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-500 text-[10px] font-bold p-1 text-center">
                            {c.name}
                          </div>
                        )}
                        <span
                          className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: c.code }}
                          title={c.name}
                        />
                      </div>

                      <div className="p-1.5 flex flex-col items-center w-full bg-white text-center border-t border-neutral-100 leading-tight">
                        <span className="text-[11px] font-extrabold text-neutral-900">
                          ₹{c.price.toLocaleString('en-IN')}
                        </span>
                        {c.mrp > c.price && (
                          <span className="text-[9px] text-neutral-400 line-through">
                            ₹{c.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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

            <div className="bg-white border border-[#EFE6D8] rounded-2xl p-4 space-y-2 text-xs text-neutral-600">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#B38548]" />
                <span>Estimated Delivery: <strong>24 - 48 Hours | Free Delivery Above ₹2,000</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-[#B38548]" />
                <span>7-day hassle-free return & exchange policy</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#B38548]" />
                <span>Prepaid & Cash on Delivery Available</span>
              </div>
            </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-neutral-700 leading-relaxed">
            <div>
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <p>
                    {product.description || product.short_description || `Elevate your wardrobe with our signature ${product.name}. Crafted from premium breathable fabrics for superior comfort, exquisite drape, and timeless elegance.`}
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
                    <span className="font-bold text-neutral-900">{product.sku || `FEM-${product.id}`}</span>

                    <span className="font-bold text-neutral-400 uppercase text-[10px]">Brand / Collection</span>
                    <span className="font-bold text-neutral-900">{product.brand || 'Femmeera'}</span>

                    <span className="font-bold text-neutral-400 uppercase text-[10px]">Category</span>
                    <span className="font-bold text-neutral-900">{product.category?.name || 'Women Apparel'}</span>

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
                  <div className="p-3.5 bg-[#FAF4EB] border border-[#EFE6D8] rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-neutral-900 font-bold">
                      <Truck className="w-4 h-4 text-[#B38548]" />
                      <span>Dispatch & Delivery Timeline</span>
                    </div>
                    <p className="text-neutral-600">Dispatched within 24-48 hours. Delivered in 3-5 business days across India.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-[#EFE6D8] pt-10 space-y-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}

      </div>
    </div>
  );
}
