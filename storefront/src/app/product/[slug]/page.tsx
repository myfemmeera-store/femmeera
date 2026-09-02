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
  }, [slug]);

  // Color options derived from product variants & images, enriched with image & price info
  const colorOptions = React.useMemo(() => {
    // Collect all unique colors from variants and images
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

    const hasAnyTaggedImages = product?.images?.some((img) => Boolean(img.color_name && img.color_name.trim()));

    const colorList: { name: string; code: string; image: string; price: number; mrp: number }[] = [];

    Array.from(allColorNames).forEach((colorName, idx) => {
      const cleanColor = colorName.trim().toLowerCase();

      // Find matching variant for hex code, price, MRP
      const matchingVariant = product?.variants?.find((v) => v.color && v.color.trim().toLowerCase() === cleanColor);

      const hex = matchingVariant?.color_code || (
        cleanColor === 'beige' ? '#E6D7C3' :
        cleanColor === 'black' ? '#222222' :
        cleanColor === 'white' ? '#FFFFFF' :
        cleanColor === 'peach' ? '#FFDAB9' :
        cleanColor === 'pink' ? '#FFC0CB' :
        cleanColor === 'ruby red' || cleanColor === 'red' ? '#E0115F' :
        cleanColor === 'royal blue' || cleanColor === 'blue' ? '#002366' :
        cleanColor === 'green' || cleanColor === 'emerald' ? '#50C878' :
        cleanColor === 'yellow' || cleanColor === 'mustard' ? '#FFDB58' :
        cleanColor === 'purple' || cleanColor === 'lavender' ? '#E6E6FA' :
        '#B38548'
      );

      // 1. Primary image with matching color_name
      let colorImg = product?.images?.find((img) => 
        img.color_name && img.color_name.trim().toLowerCase() === cleanColor && img.is_primary
      )?.image_url;

      // 2. Any image matching color_name tag from admin upload section
      if (!colorImg && product?.images) {
        colorImg = product.images.find((img) => 
          img.color_name && img.color_name.trim().toLowerCase() === cleanColor
        )?.image_url;
      }

      // 4. Match on image_url filename (e.g. pink.jpg, blue.png, black.webp)
      if (!colorImg && product?.images) {
        colorImg = product.images.find((img) => 
          img.image_url && img.image_url.toLowerCase().includes(cleanColor)
        )?.image_url;
      }

      // 5. Smart partition fallback: divide untagged images proportionally across variant colors
      if (!colorImg && !hasAnyTaggedImages && product?.images && product.images.length > 0) {
        const colorArray = Array.from(allColorNames);
        const colorIndex = colorArray.findIndex((c) => c.trim().toLowerCase() === cleanColor);
        if (colorIndex !== -1) {
          const totalImages = product.images.length;
          const totalColors = colorArray.length;
          const itemsPerColor = Math.max(1, Math.floor(totalImages / totalColors));
          const startIndex = Math.min(colorIndex * itemsPerColor, totalImages - 1);
          colorImg = product.images[startIndex]?.image_url;
        }
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

  // Initial color setup on product load
  useEffect(() => {
    if (colorOptions.length > 0 && (!selectedColor || !colorOptions.some(c => c.name === selectedColor))) {
      setSelectedColor(colorOptions[0].name);
    }
  }, [colorOptions]);

  // Color-specific image gallery (STRICTLY displays images of selectedColor)
  const colorSpecificImages = React.useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return [];
    }
    const cleanSelected = (selectedColor || '').trim().toLowerCase();

    // 1. Filter images uploaded into this specific color section in admin
    const colorSectionMatches = product.images.filter((img) => 
      img.color_name && img.color_name.trim().toLowerCase() === cleanSelected
    );
    if (colorSectionMatches.length > 0) {
      return colorSectionMatches.map((img) => img.image_url);
    }

    // 2. Filter images whose image_url contains color name
    const urlMatches = product.images.filter((img) => 
      img.image_url && img.image_url.toLowerCase().includes(cleanSelected)
    );
    if (urlMatches.length > 0) {
      return urlMatches.map((img) => img.image_url);
    }

    // 3. Smart partition fallback: if untagged, assign distinct image slice to each color
    const hasAnyTagged = product.images.some((img) => Boolean(img.color_name && img.color_name.trim()));
    const allVariantColors = Array.from(new Set(product.variants?.map((v) => v.color?.trim()).filter(Boolean) || []));

    if (!hasAnyTagged && allVariantColors.length > 0 && product.images.length > 0) {
      const colorIndex = allVariantColors.findIndex((c) => c.toLowerCase() === cleanSelected);
      if (colorIndex !== -1) {
        const totalImages = product.images.length;
        const totalColors = allVariantColors.length;
        const itemsPerColor = Math.max(1, Math.floor(totalImages / totalColors));
        const startIndex = Math.min(colorIndex * itemsPerColor, totalImages - 1);
        const endIndex = colorIndex === totalColors - 1 ? totalImages : Math.min(startIndex + itemsPerColor, totalImages);

        const sliced = product.images.slice(startIndex, endIndex);
        if (sliced.length > 0) {
          return sliced.map((img) => img.image_url);
        }
      }
    }

    // 4. Single image matched in colorOptions for selected color
    const activeColorCard = colorOptions.find((c) => c.name.trim().toLowerCase() === cleanSelected);
    if (activeColorCard?.image) {
      return [activeColorCard.image];
    }

    // 5. Untagged images
    const untaggedImages = product.images.filter((img) => !img.color_name || !img.color_name.trim());
    if (untaggedImages.length > 0) {
      return untaggedImages.map((img) => img.image_url);
    }

    return [product.images[0].image_url];
  }, [product?.images, product?.variants, selectedColor, colorOptions]);

  // All product images list with selected color images ordered first
  const displayImages = React.useMemo(() => {
    if (!product?.images || product.images.length === 0) return [];

    const matchedUrls = colorSpecificImages;
    const remainingUrls = product.images
      .map((img) => img.image_url)
      .filter((url) => !matchedUrls.includes(url));

    return [...matchedUrls, ...remainingUrls];
  }, [product?.images, colorSpecificImages]);

  // Sync main stage image when selectedColor changes
  useEffect(() => {
    if (selectedColor && colorOptions.length > 0) {
      const activeCard = colorOptions.find((c) => c.name.trim().toLowerCase() === selectedColor.trim().toLowerCase());
      if (activeCard?.image) {
        setSelectedImage(activeCard.image);
      } else if (displayImages.length > 0) {
        setSelectedImage(displayImages[0]);
      }
    }
  }, [selectedColor, colorOptions, displayImages]);

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
    <div className="min-h-screen bg-[#FDFBF7] py-4 px-3 sm:px-6 lg:px-8 space-y-8 pb-24 sm:pb-12">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-[11px] text-neutral-500 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <Link href="/" className="hover:text-[#B38548]">Home</Link>
          <span>/</span>
          <Link href="/women" className="hover:text-[#B38548]">Western Wear</Link>
          <span>/</span>
          <Link href="/women/western-wear" className="hover:text-[#B38548]">Dresses</Link>
          <span>/</span>
          <span className="font-semibold text-neutral-900">{product.name}</span>
        </nav>

        {/* Product Viewer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          
          {/* Gallery Column: Main Stage Photo on Top (Mobile) / Left Thumbnails + Main Stage (Desktop) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
            
            {/* Main Stage Image (First on Mobile, Right on Desktop) */}
            <div className="relative w-full order-1 sm:order-2 flex-1 aspect-3/4 sm:aspect-4/5 bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EFE6D8] shadow-xs group">
              <Image src={hoveredColorImage || selectedImage || displayImages[0]} alt={product.name} fill priority className="object-cover transition-all duration-300" />

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

            {/* Thumbnails List (Second on Mobile as horizontal row, Left on Desktop as vertical column) */}
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
                    <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right Options Column */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            
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

            {/* Price & Discount Section */}
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

              {/* Prepaid Offer Callout */}
              <div className="bg-[#FAF3E7] border border-[#E8DEC8] rounded-xl p-3 flex items-center space-x-2 text-xs text-[#7A6240] mt-2">
                <Sparkles className="w-4 h-4 text-[#B38548] shrink-0" />
                <span>Get it for <strong>₹{Math.round(price * 0.9).toLocaleString('en-IN')}</strong> with 10% Off On Prepaid Orders</span>
              </div>
            </div>

            {/* Color Selection Cards */}
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
                      {/* Color Preview Image Box */}
                      <div className="relative w-full aspect-3/4 bg-neutral-100 overflow-hidden">
                        {c.image ? (
                          <Image
                            src={c.image}
                            alt={`${product.name} - ${c.name}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-500 text-[10px] font-bold p-1 text-center">
                            {c.name}
                          </div>
                        )}
                        {/* Color Dot Swatch Badge */}
                        <span
                          className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: c.code }}
                          title={c.name}
                        />
                      </div>

                      {/* Color Price & MRP Box */}
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

            {/* Dual Desktop CTAs */}
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

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-neutral-200/80 shadow-2xl flex items-center gap-2.5 sm:hidden">
        <div className="flex flex-col leading-tight mr-auto">
          <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">Total</span>
          <span className="font-sans font-black text-lg text-neutral-900">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`py-2.5 px-3.5 font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
            isOutOfStock
              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              : 'bg-[#B38548] text-white active:scale-95'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
        </button>

        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="py-2.5 px-3.5 font-sans font-bold text-xs uppercase tracking-wider rounded-xl bg-neutral-900 text-white shadow-md shrink-0 active:scale-95"
          >
            BUY NOW
          </button>
        )}
      </div>
    </div>
  );
}
