'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { mediaService } from '@/services/mediaService';
import { Category, ProductVariant } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { ChevronDown, ChevronUp, ImagePlus, Trash2, ArrowLeft, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Size Input for Quick Add
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Accordion Section Toggle States for Mobile
  const [openSections, setOpenSections] = useState({
    basic: true,
    pricing: true,
    variants: true,
    images: true,
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

  // Clothing Variants (Sizes S, M, L, XL by default)
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([
    { size: 'S', color: 'Multicolor', sku: 'FEM-DR-S', price: 1499, mrp: 1999, stock: 25, low_stock_threshold: 5 },
    { size: 'M', color: 'Multicolor', sku: 'FEM-DR-M', price: 1499, mrp: 1999, stock: 30, low_stock_threshold: 5 },
    { size: 'L', color: 'Multicolor', sku: 'FEM-DR-L', price: 1499, mrp: 1999, stock: 20, low_stock_threshold: 5 },
    { size: 'XL', color: 'Multicolor', sku: 'FEM-DR-XL', price: 1499, mrp: 1999, stock: 15, low_stock_threshold: 5 },
  ]);

  // Image Upload Previews
  const [images, setImages] = useState<{ url: string; file?: File }[]>([]);

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

  const buildCategoryOptions = () => {
    const options: { value: string; label: string }[] = [
      { value: '', label: '-- Select Category --' },
    ];

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    for (const file of selectedFiles) {
      try {
        const res = await mediaService.uploadImage(file, 'products');
        if (res.success && res.data) {
          setImages((prev) => [...prev, { url: res.data!.url, file }]);
        }
      } catch (err) {
        showToast('Product image upload failed.', 'error');
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const addSizeVariant = (sizeName?: string) => {
    const sz = (sizeName || customSizeInput || 'Free Size').trim();
    if (!sz) return;

    // Check if already added
    if (variants.some((v) => v.size?.toLowerCase() === sz.toLowerCase())) {
      showToast(`Size "${sz}" already exists in variants.`, 'error');
      return;
    }

    const newSKU = `FEM-${sz.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setVariants((prev) => [
      ...prev,
      {
        size: sz,
        color: 'Multicolor',
        sku: newSKU,
        price: Number(formData.price) || 1499,
        mrp: Number(formData.mrp) || 1999,
        stock: 20,
        low_stock_threshold: 5,
      },
    ]);
    setCustomSizeInput('');
    showToast(`Added size variant "${sz}".`, 'success');
  };

  const deleteSizeVariant = (index: number) => {
    if (variants.length <= 1) {
      showToast('Product must have at least 1 size variant.', 'error');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      showToast('Please provide a product name and select a category.', 'error');
      return;
    }

    if (variants.length === 0) {
      showToast('Please add at least 1 size variant.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const uniqueSuffix = Date.now().toString().slice(-6);
      const mainSku = `FMR-${formData.slug ? formData.slug.toUpperCase().slice(0, 10) : 'PROD'}-${uniqueSuffix}`;

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
        variants: variants.map((v, idx) => ({
          sku: v.sku && !v.sku.startsWith('FEM-DR-') ? v.sku : `${mainSku}-${(v.size || 'FREE').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${idx + 1}`,
          size: v.size || 'Free Size',
          color: v.color || 'Multicolor',
          price: Number(v.price) || Number(formData.price) || 1499,
          mrp: Number(v.mrp) || Number(formData.mrp) || 1999,
          stock: Number(v.stock) || 10,
          low_stock_threshold: Number(v.low_stock_threshold) || 5,
        })),
        images: images.map((img, idx) => ({
          image_url: img.url,
          sort_order: idx + 1,
          is_primary: idx === 0,
        })),
      };

      const res = await productService.createProduct(payload);
      if (res.success) {
        showToast('Clothing product published successfully!', 'success');
        router.push('/dashboard/products');
      } else {
        const errorMsg = res.errors
          ? Object.values(res.errors).flat().join(' | ')
          : (res.message || 'Failed to save product.');
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
          <h1 className="text-xl font-black text-neutral-900 tracking-tight">Add New Clothing Product</h1>
          <p className="text-xs text-neutral-500">Create product details, pricing, clothing variants &amp; media</p>
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
            <span>1. Basic Product Information</span>
            {openSections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.basic && (
            <div className="space-y-4 pt-4">
              <Input
                label="Product Name"
                placeholder="e.g. Floral Printed Silk Kurti"
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
                  label="Gender Target"
                  options={[
                    { value: 'WOMEN', label: 'Women' },
                    { value: 'UNISEX', label: 'Unisex' },
                  ]}
                  value={formData.gender}
                  onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
                />
              </div>

              <Textarea
                label="Product Description"
                rows={3}
                placeholder="Detailed fabric details, occasion guide, care instructions..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          )}
        </Card>

        {/* 2. Pricing & Flags Section */}
        <Card className="!p-4 sm:!p-6">
          <button
            type="button"
            onClick={() => toggleSection('pricing')}
            className="w-full flex items-center justify-between font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3"
          >
            <span>2. Pricing &amp; Marketing Flags</span>
            {openSections.pricing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.pricing && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Selling Price (₹)"
                  type="number"
                  placeholder="1499"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  required
                />
                <Input
                  label="MRP Original Price (₹)"
                  type="number"
                  placeholder="1999"
                  value={formData.mrp}
                  onChange={(e) => setFormData((p) => ({ ...p, mrp: e.target.value }))}
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

        {/* 3. Clothing Variants Matrix with Dynamic Add/Remove Sizes */}
        <Card className="!p-4 sm:!p-6">
          <button
            type="button"
            onClick={() => toggleSection('variants')}
            className="w-full flex items-center justify-between font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3"
          >
            <div className="flex items-center space-x-2">
              <span>3. Clothing Size Variants &amp; Stock</span>
              <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-mono">
                {variants.length} {variants.length === 1 ? 'Size' : 'Sizes'}
              </span>
            </div>
            {openSections.variants ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.variants && (
            <div className="space-y-4 pt-4">
              {/* Quick Size Preset Buttons & Custom Size Input */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Quick Add Size Presets:
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', '38', '40', '42'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => addSizeVariant(sz)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-500 hover:text-white font-bold text-[11px] transition-colors shadow-2xs"
                    >
                      + {sz}
                    </button>
                  ))}
                </div>

                {/* Custom Size Adder Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                  <input
                    type="text"
                    placeholder="Enter custom size (e.g. 44, Tailored, Plus Size)..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg font-bold text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSizeVariant();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addSizeVariant()}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Size
                  </Button>
                </div>
              </div>

              {/* Size Variants Matrix List */}
              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs items-end">
                    <div>
                      <span className="block font-bold text-neutral-500 uppercase text-[10px]">Size Name</span>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                        placeholder="e.g. S, M, XL"
                        className="w-full mt-1 p-1.5 bg-white border border-neutral-300 rounded font-bold text-neutral-900"
                        required
                      />
                    </div>
                    <div>
                      <span className="block font-bold text-neutral-500 uppercase text-[10px]">SKU Code</span>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        className="w-full mt-1 p-1.5 bg-white border border-neutral-300 rounded font-mono text-[11px]"
                        required
                      />
                    </div>
                    <div>
                      <span className="block font-bold text-neutral-500 uppercase text-[10px]">Selling Price (₹)</span>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                        className="w-full mt-1 p-1.5 bg-white border border-neutral-300 rounded font-bold"
                        required
                      />
                    </div>
                    <div>
                      <span className="block font-bold text-neutral-500 uppercase text-[10px]">Stock Qty</span>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                        className="w-full mt-1 p-1.5 bg-white border border-neutral-300 rounded font-bold text-emerald-700"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end pb-0.5">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => deleteSizeVariant(idx)}
                        className="!px-2.5 !py-1.5"
                        title="Delete Size Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span className="text-[10px]">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* 4. Product Media & Image Uploader */}
        <Card className="!p-4 sm:!p-6">
          <button
            type="button"
            onClick={() => toggleSection('images')}
            className="w-full flex items-center justify-between font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3"
          >
            <span>4. Product Media &amp; Photography</span>
            {openSections.images ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {openSections.images && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-3/4 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 group">
                    <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                <label className="aspect-3/4 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-black transition-colors bg-neutral-50">
                  <ImagePlus className="w-6 h-6 text-neutral-400 mb-1" />
                  <span className="text-[11px] font-bold text-neutral-700">Upload Photo</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">Camera or File</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
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
            Publish Product
          </Button>
        </div>
      </form>
    </div>
  );
}
