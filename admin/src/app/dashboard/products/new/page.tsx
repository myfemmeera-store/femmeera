'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { mediaService } from '@/services/mediaService';
import { Category } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { ChevronDown, ChevronUp, ImagePlus, Trash2, ArrowLeft, CheckCircle2, Plus, Sparkles, Palette } from 'lucide-react';
import Link from 'next/link';

export interface ColorGroup {
  id: string;
  name: string;
  code: string;
  images: { url: string; file?: File }[];
}

export interface SizeStockItem {
  color_name: string;
  color_code: string;
  size: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
}

const PRESET_COLORS = [
  { name: 'Royal Blue', code: '#002366' },
  { name: 'Ruby Red', code: '#E0115F' },
  { name: 'Emerald Green', code: '#2E7D32' },
  { name: 'Mustard Yellow', code: '#FBC02D' },
  { name: 'Black', code: '#000000' },
  { name: 'Ivory White', code: '#FFFFFF' },
  { name: 'Blush Pink', code: '#FF69B4' },
  { name: 'Gold', code: '#D4AF37' },
  { name: 'Beige', code: '#E6D7C3' },
  { name: 'Maroon', code: '#800000' },
  { name: 'Navy Blue', code: '#000080' },
  { name: 'Purple', code: '#7B1FA2' },
];

export default function AddProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion Section Toggle States
  const [openSections, setOpenSections] = useState({
    basic: true,
    pricing: true,
    colors: true,
    matrix: true,
    seo: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category_id: '',
    brand: 'Femmeera',
    gender: 'WOMEN',
    status: 'ACTIVE',
    is_featured: false,
    is_new: true,
    is_best_seller: false,
    mrp: '1999',
    price: '1499',
    seo_title: '',
    seo_description: '',
  });

  // Colors & Images State
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([
    { id: '1', name: 'Royal Blue', code: '#002366', images: [] },
  ]);

  // Sizes State
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // New Custom Color Inputs
  const [customColorName, setCustomColorName] = useState('');
  const [customColorCode, setCustomColorCode] = useState('#B38548');

  // Matrix Stock Data
  const [matrixData, setMatrixData] = useState<{ [key: string]: { price: number; mrp: number; stock: number; sku: string } }>({});

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, category_id: String(res.data![0].id) }));
          }
        }
      })
      .finally(() => setIsLoadingCategories(false));
  }, []);

  // Update Matrix Data when colors or sizes change
  useEffect(() => {
    const newMatrix: { [key: string]: { price: number; mrp: number; stock: number; sku: string } } = { ...matrixData };
    const basePrice = Number(formData.price) || 1499;
    const baseMrp = Number(formData.mrp) || 1999;

    colorGroups.forEach((c) => {
      sizes.forEach((sz) => {
        const key = `${c.name}_${sz}`;
        if (!newMatrix[key]) {
          const colorClean = c.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
          const sizeClean = sz.toUpperCase().replace(/[^A-Z0-9]/g, '');
          const sku = `FEM-${colorClean}-${sizeClean}-${Math.floor(100 + Math.random() * 900)}`;
          newMatrix[key] = {
            price: basePrice,
            mrp: baseMrp,
            stock: 20,
            sku,
          };
        }
      });
    });

    setMatrixData(newMatrix);
  }, [colorGroups, sizes, formData.price, formData.mrp]);

  const buildCategoryOptions = () => {
    const options: { value: string; label: string }[] = [{ value: '', label: '-- Select Category --' }];
    categories.forEach((cat) => {
      options.push({ value: String(cat.id), label: cat.name });
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((child) => {
          options.push({ value: String(child.id), label: `${cat.name} > ${child.name}` });
        });
      }
    });
    return options;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  // Color Group Handlers
  const addColorGroup = (name: string, code: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    if (colorGroups.some((cg) => cg.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast(`Color "${cleanName}" is already added.`, 'error');
      return;
    }

    const newGroup: ColorGroup = {
      id: Date.now().toString(),
      name: cleanName,
      code: code || '#000000',
      images: [],
    };

    setColorGroups((prev) => [...prev, newGroup]);
    setCustomColorName('');
    showToast(`Added color "${cleanName}".`, 'success');
  };

  const removeColorGroup = (id: string) => {
    if (colorGroups.length <= 1) {
      showToast('Product must have at least 1 color option.', 'error');
      return;
    }
    setColorGroups((prev) => prev.filter((cg) => cg.id !== id));
  };

  const handleColorImageSelect = async (colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    for (const file of files) {
      const localPreviewUrl = URL.createObjectURL(file);

      setColorGroups((prev) =>
        prev.map((cg) => (cg.id === colorId ? { ...cg, images: [...cg.images, { url: localPreviewUrl, file }] } : cg))
      );

      try {
        const res = await mediaService.uploadImage(file, 'products');
        if (res.success && res.data) {
          const uploadedUrl = res.data.url;
          setColorGroups((prev) =>
            prev.map((cg) =>
              cg.id === colorId
                ? {
                    ...cg,
                    images: cg.images.map((img) => (img.url === localPreviewUrl ? { ...img, url: uploadedUrl } : img)),
                  }
                : cg
            )
          );
        } else {
          showToast(res.message || 'Image upload failed.', 'error');
          setColorGroups((prev) =>
            prev.map((cg) => (cg.id === colorId ? { ...cg, images: cg.images.filter((img) => img.url !== localPreviewUrl) } : cg))
          );
        }
      } catch (err) {
        showToast('Image upload failed.', 'error');
        setColorGroups((prev) =>
          prev.map((cg) => (cg.id === colorId ? { ...cg, images: cg.images.filter((img) => img.url !== localPreviewUrl) } : cg))
        );
      }
    }
  };

  const removeColorImage = (colorId: string, imageIndex: number) => {
    setColorGroups((prev) =>
      prev.map((cg) => (cg.id === colorId ? { ...cg, images: cg.images.filter((_, i) => i !== imageIndex) } : cg))
    );
  };

  // Size Handlers
  const addSize = (sizeName?: string) => {
    const sz = (sizeName || customSizeInput).trim();
    if (!sz) return;
    if (sizes.includes(sz)) {
      showToast(`Size "${sz}" already exists.`, 'error');
      return;
    }
    setSizes((prev) => [...prev, sz]);
    setCustomSizeInput('');
    showToast(`Added size "${sz}".`, 'success');
  };

  const removeSize = (sz: string) => {
    if (sizes.length <= 1) {
      showToast('Product must have at least 1 size.', 'error');
      return;
    }
    setSizes((prev) => prev.filter((s) => s !== sz));
  };

  const handleMatrixChange = (key: string, field: 'price' | 'mrp' | 'stock' | 'sku', value: any) => {
    setMatrixData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const applyStockToAll = (stockQty: number) => {
    setMatrixData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k].stock = stockQty;
      });
      return updated;
    });
    showToast(`Set stock quantity of ${stockQty} for all combinations.`, 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      showToast('Please provide a product name and select a category.', 'error');
      return;
    }

    if (colorGroups.length === 0) {
      showToast('Please add at least 1 color option.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const uniqueSuffix = Date.now().toString().slice(-6);
      const mainSku = `FMR-${formData.slug ? formData.slug.toUpperCase().slice(0, 10) : 'PROD'}-${uniqueSuffix}`;

      // Build compiled images payload
      const allImagesPayload: { image_url: string; color_name: string; is_primary: boolean; sort_order: number }[] = [];
      let sortCounter = 1;

      colorGroups.forEach((cg) => {
        cg.images.forEach((img, idx) => {
          allImagesPayload.push({
            image_url: img.url,
            color_name: cg.name,
            is_primary: sortCounter === 1,
            sort_order: sortCounter++,
          });
        });
      });

      // Build compiled variants payload (Color + Size matrix)
      const allVariantsPayload: any[] = [];
      colorGroups.forEach((cg) => {
        sizes.forEach((sz) => {
          const key = `${cg.name}_${sz}`;
          const item = matrixData[key] || {
            price: Number(formData.price) || 1499,
            mrp: Number(formData.mrp) || 1999,
            stock: 20,
            sku: `${mainSku}-${cg.name.toUpperCase().slice(0, 3)}-${sz.toUpperCase()}`,
          };

          allVariantsPayload.push({
            sku: item.sku || `${mainSku}-${cg.name.toUpperCase().slice(0, 3)}-${sz.toUpperCase()}`,
            color: cg.name,
            color_code: cg.code,
            size: sz,
            price: Number(item.price) || Number(formData.price) || 1499,
            mrp: Number(item.mrp) || Number(formData.mrp) || 1999,
            stock: Number(item.stock) || 0,
            low_stock_threshold: 5,
          });
        });
      });

      const payload = {
        name: formData.name,
        slug: formData.slug || `product-${uniqueSuffix}`,
        category_id: Number(formData.category_id),
        description: formData.description,
        short_description: formData.short_description,
        brand: formData.brand || 'Femmeera',
        gender: formData.gender as 'WOMEN',
        status: formData.status as 'ACTIVE',
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_best_seller: formData.is_best_seller,
        sku: mainSku,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        variants: allVariantsPayload,
        images: allImagesPayload,
      };

      const res = await productService.createProduct(payload);
      if (res.success) {
        showToast('Product with Color Variants created successfully!', 'success');
        router.push('/dashboard/products');
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join(' | ')
          : res.message || 'Failed to save product.';
        showToast(errorMsg, 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Bar */}
      <div className="flex items-center space-x-3">
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm" className="!p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight">Add New Product with Color Variants</h1>
          <p className="text-xs text-neutral-500">Configure color options, separate color photos &amp; Color+Size stock matrix</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
        {/* 1. Basic Information Section */}
        <Card className="!p-4 sm:!p-6">
          <button
            type="button"
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3"
          >
            <span>1. Basic Product Details</span>
            {openSections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.basic && (
            <div className="space-y-4 pt-4">
              <Input
                label="Product Name"
                placeholder="e.g. Designer Anarkali Suit Set"
                value={formData.name}
                onChange={handleNameChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="URL Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  required
                />

                <Select
                  label="Category"
                  options={buildCategoryOptions()}
                  value={formData.category_id}
                  onChange={(e) => setFormData((p) => ({ ...p, category_id: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Brand Name"
                  value={formData.brand}
                  onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                />

                <Select
                  label="Gender Category"
                  options={[
                    { value: 'WOMEN', label: 'Women' },
                    { value: 'UNISEX', label: 'Unisex' },
                    { value: 'MEN', label: 'Men' },
                  ]}
                  value={formData.gender}
                  onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
                />
              </div>

              <Textarea
                label="Short Description (Summary)"
                rows={2}
                placeholder="Brief highlight displayed on catalog cards..."
                value={formData.short_description}
                onChange={(e) => setFormData((p) => ({ ...p, short_description: e.target.value }))}
              />

              <Textarea
                label="Full Product Description & Care Info"
                rows={4}
                placeholder="Detailed fabric info, embroidery specifications, washing care..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          )}
        </Card>

        {/* 2. Base Pricing & Badges */}
        <Card className="!p-4 sm:!p-6">
          <button
            type="button"
            onClick={() => toggleSection('pricing')}
            className="w-full flex items-center justify-between font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3"
          >
            <span>2. Pricing &amp; Visibility Badges</span>
            {openSections.pricing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.pricing && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Base Selling Price (₹)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  required
                />

                <Input
                  label="Base Maximum Retail Price (MRP ₹)"
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => setFormData((p) => ({ ...p, mrp: e.target.value }))}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData((p) => ({ ...p, is_new: e.target.checked }))}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>New Arrival Badge</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData((p) => ({ ...p, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_best_seller}
                    onChange={(e) => setFormData((p) => ({ ...p, is_best_seller: e.target.checked }))}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Best Seller Badge</span>
                </label>
              </div>
            </div>
          )}
        </Card>

        {/* 3. Color Variants & Dedicated Images Section */}
        <Card className="!p-4 sm:!p-6 border-2 border-[#B38548]/30">
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className="w-full flex items-center justify-between font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3"
          >
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-[#B38548]" />
              <span>3. Color Variants &amp; Separate Color Photos</span>
              <span className="text-xs bg-[#B38548] text-white px-2 py-0.5 rounded-full font-bold">
                {colorGroups.length} {colorGroups.length === 1 ? 'Color' : 'Colors'}
              </span>
            </div>
            {openSections.colors ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.colors && (
            <div className="space-y-6 pt-4">
              {/* Quick Preset Colors Palette */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B38548]" />
                  Click to Add Popular Color Options:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_COLORS.map((pc) => (
                    <button
                      key={pc.name}
                      type="button"
                      onClick={() => addColorGroup(pc.name, pc.code)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-neutral-300 hover:border-[#B38548] flex items-center space-x-1.5 text-[11px] font-bold shadow-2xs transition-transform hover:scale-105"
                    >
                      <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: pc.code }} />
                      <span>{pc.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Creator */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
                  <input
                    type="color"
                    value={customColorCode}
                    onChange={(e) => setCustomColorCode(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5"
                    title="Choose Hex Color Code"
                  />
                  <input
                    type="text"
                    placeholder="Enter color name (e.g. Peacock Blue, Rose Gold)..."
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-xl font-bold text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addColorGroup(customColorName, customColorCode);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addColorGroup(customColorName, customColorCode)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Custom Color
                  </Button>
                </div>
              </div>

              {/* Color Cards & Dedicated Image Uploaders */}
              <div className="space-y-6">
                {colorGroups.map((cg) => (
                  <div key={cg.id} className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-[#EFE6D8] space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: cg.code }} />
                        <span className="font-serif font-bold text-lg text-neutral-900">{cg.name}</span>
                        <span className="font-mono text-xs text-neutral-400 font-bold">{cg.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColorGroup(cg.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Color</span>
                      </button>
                    </div>

                    {/* Per-Color Photos Gallery */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-700 block">
                        Upload Product Photos for <span className="text-[#B38548] font-black">{cg.name}</span>:
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {cg.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-3/4 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 group">
                            <img src={img.url} alt={`${cg.name} ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeColorImage(cg.id, idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Cover
                              </span>
                            )}
                          </div>
                        ))}

                        <label className="aspect-3/4 border-2 border-dashed border-[#B38548]/40 hover:border-[#B38548] rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer bg-[#FAF6F0] transition-colors">
                          <ImagePlus className="w-6 h-6 text-[#B38548] mb-1" />
                          <span className="text-[11px] font-bold text-neutral-900">+ {cg.name} Photos</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleColorImageSelect(cg.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* 4. Color + Size Stock Matrix Table */}
        <Card className="!p-4 sm:!p-6">
          <button
            type="button"
            onClick={() => toggleSection('matrix')}
            className="w-full flex items-center justify-between font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3"
          >
            <div className="flex items-center space-x-2">
              <span>4. Stock &amp; Price Matrix (Color + Size Combinations)</span>
              <span className="text-xs bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                {colorGroups.length * sizes.length} Variants
              </span>
            </div>
            {openSections.matrix ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.matrix && (
            <div className="space-y-6 pt-4 text-xs">
              {/* Size Selector Strip */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <span className="font-bold text-neutral-900 block">Clothing Sizes Available:</span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <span key={sz} className="px-3 py-1 bg-white border border-neutral-300 rounded-xl font-bold flex items-center space-x-1.5">
                      <span>{sz}</span>
                      {sizes.length > 1 && (
                        <button type="button" onClick={() => removeSize(sz)} className="text-neutral-400 hover:text-rose-600">
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add size (e.g. S, M, L, XL, XXL)..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-xl font-bold text-xs"
                  />
                  <Button type="button" size="sm" onClick={() => addSize()} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Size
                  </Button>
                </div>
              </div>

              {/* Apply Bulk Stock Tool */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-900">Bulk Stock Tool:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => applyStockToAll(20)}
                    className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-[11px]"
                  >
                    Set 20 Stock to All
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStockToAll(50)}
                    className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-[11px]"
                  >
                    Set 50 Stock to All
                  </button>
                </div>
              </div>

              {/* Color + Size Combination Stock Matrix */}
              <div className="space-y-6">
                {colorGroups.map((cg) => (
                  <div key={cg.id} className="border border-neutral-200 rounded-2xl overflow-hidden">
                    <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: cg.code }} />
                        <span className="font-bold text-neutral-900">{cg.name} Inventory Matrix</span>
                      </div>
                    </div>

                    <div className="divide-y divide-neutral-200 bg-white">
                      {sizes.map((sz) => {
                        const key = `${cg.name}_${sz}`;
                        const item = matrixData[key] || { price: 1499, mrp: 1999, stock: 20, sku: '' };
                        return (
                          <div key={sz} className="p-3 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Combination</span>
                              <span className="font-bold text-neutral-900">{cg.name} / {sz}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 block uppercase">SKU Code</span>
                              <input
                                type="text"
                                value={item.sku}
                                onChange={(e) => handleMatrixChange(key, 'sku', e.target.value)}
                                className="w-full p-1.5 bg-neutral-50 border border-neutral-300 rounded font-mono text-[11px]"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Price (₹)</span>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleMatrixChange(key, 'price', Number(e.target.value))}
                                className="w-full p-1.5 bg-white border border-neutral-300 rounded font-bold"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 block uppercase">MRP (₹)</span>
                              <input
                                type="number"
                                value={item.mrp}
                                onChange={(e) => handleMatrixChange(key, 'mrp', Number(e.target.value))}
                                className="w-full p-1.5 bg-white border border-neutral-300 rounded"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Stock Qty</span>
                              <input
                                type="number"
                                value={item.stock}
                                onChange={(e) => handleMatrixChange(key, 'stock', Number(e.target.value))}
                                className="w-full p-1.5 bg-white border border-neutral-300 rounded font-bold text-emerald-700"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Sticky Mobile/Desktop Action Bar */}
        <div className="fixed bottom-14 lg:bottom-4 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 shadow-2xl flex items-center justify-end space-x-3">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting} size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Publish Product with Colors
          </Button>
        </div>
      </form>
    </div>
  );
}
