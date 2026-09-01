'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/services/apiClient';
import { categoryService } from '@/services/categoryService';
import { mediaService } from '@/services/mediaService';
import { Category, Product, ProductVariant } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Plus, Sparkles, Trash2, Edit3, Save, Layers, Upload, ImagePlus, CheckCircle2 } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: 'Femmeera',
    gender: 'WOMEN',
    status: 'ACTIVE',
    category_id: '',
    description: '',
    short_description: '',
  });

  const [productImages, setProductImages] = useState<any[]>([]);

  // Variant Generator State
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [selectedColorsText, setSelectedColorsText] = useState('Midnight Black, Ivory White');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [basePrice, setBasePrice] = useState('1499');
  const [baseMrp, setBaseMrp] = useState('1999');
  const [baseStock, setBaseStock] = useState('15');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Single Variant Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editForm, setEditForm] = useState({
    sku: '',
    size: '',
    color: '',
    color_code: '#000000',
    price: '',
    mrp: '',
    stock: '',
  });
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  const loadProduct = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient<Product>(`/admin/products/${productId}`),
        categoryService.getCategories(),
      ]);

      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      if (prodRes.success && prodRes.data) {
        const p = prodRes.data;
        setProduct(p);
        setFormData({
          name: p.name || '',
          sku: p.sku || '',
          brand: p.brand || 'Femmeera',
          gender: p.gender || 'WOMEN',
          status: p.status || 'ACTIVE',
          category_id: p.category_id ? String(p.category_id) : '',
          description: p.description || '',
          short_description: p.short_description || '',
        });

        if (p.images && p.images.length > 0) {
          setProductImages(p.images.map((img) => ({
            image_url: img.image_url,
            color_name: img.color_name || null,
          })));
        }
      } else {
        setError(prodRes.message || 'Product not found.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading product details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) loadProduct();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    setIsUploadingImage(true);
    for (const file of selectedFiles) {
      const localPreviewUrl = URL.createObjectURL(file);
      setProductImages((prev) => [...prev, { image_url: localPreviewUrl, color_name: null }]);

      try {
        const res = await mediaService.uploadImage(file, 'products');
        if (res.success && res.data) {
          const uploadedUrl = res.data.url;
          setProductImages((prev) =>
            prev.map((img) => (img.image_url === localPreviewUrl ? { ...img, image_url: uploadedUrl } : img))
          );
        } else {
          showToast(res.message || 'Image upload failed.', 'error');
          setProductImages((prev) => prev.filter((img) => img.image_url !== localPreviewUrl));
        }
      } catch (err) {
        showToast('Image upload failed.', 'error');
        setProductImages((prev) => prev.filter((img) => img.image_url !== localPreviewUrl));
      }
    }
    setIsUploadingImage(false);
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);

    try {
      const res = await apiClient<Product>(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          brand: formData.brand,
          gender: formData.gender,
          status: formData.status,
          category_id: formData.category_id ? Number(formData.category_id) : null,
          description: formData.description,
          short_description: formData.short_description,
          images: productImages,
        }),
      });

      if (res.success) {
        showToast('Product details and images saved successfully.', 'success');
        loadProduct();
      } else {
        showToast(res.message || 'Failed to save product.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating product.', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleGenerateVariants = async (e: React.FormEvent) => {
    e.preventDefault();
    const colors = selectedColorsText.split(',').map((c) => c.trim()).filter(Boolean);
    if (colors.length === 0 || selectedSizes.length === 0) {
      showToast('Please specify at least 1 color and 1 size.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiClient<Product>(`/admin/products/${productId}/variants/generate`, {
        method: 'POST',
        body: JSON.stringify({
          colors,
          sizes: selectedSizes,
          base_price: parseFloat(basePrice),
          base_mrp: parseFloat(baseMrp),
          base_stock: parseInt(baseStock, 10),
        }),
      });

      if (res.success && res.data) {
        showToast(res.message || 'Variants matrix generated successfully.', 'success');
        setProduct(res.data);
        setGeneratorModalOpen(false);
      } else {
        showToast(res.message || 'Unable to generate variants.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error generating variants matrix.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setEditForm({
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      color_code: variant.color_code || '#000000',
      price: variant.price.toString(),
      mrp: variant.mrp.toString(),
      stock: variant.stock.toString(),
    });
    setEditModalOpen(true);
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    setIsSavingVariant(true);
    try {
      const res = await apiClient<ProductVariant>(`/admin/products/${productId}/variants/${editingVariant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          sku: editForm.sku,
          size: editForm.size,
          color: editForm.color,
          color_code: editForm.color_code,
          price: parseFloat(editForm.price),
          mrp: parseFloat(editForm.mrp),
          stock: parseInt(editForm.stock, 10),
        }),
      });

      if (res.success) {
        showToast('Variant updated successfully.', 'success');
        setEditModalOpen(false);
        loadProduct();
      } else {
        showToast(res.message || 'Unable to save variant.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving variant.', 'error');
    } finally {
      setIsSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const res = await apiClient(`/admin/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('Variant removed.', 'success');
        loadProduct();
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting variant.', 'error');
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return <div className="p-8 text-center text-xs font-bold text-rose-600">{error || 'Product not found.'}</div>;
  }

  const variants = product.variants || [];

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm" className="!p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Edit {product.name}</h1>
            <p className="text-xs text-neutral-500">Manage product photos, details, prices & size/color matrix</p>
          </div>
        </div>

        <Button type="button" onClick={handleSaveProduct} isLoading={isSavingProduct} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
          Save Product Changes
        </Button>
      </div>

      {/* 1. Basic Product Info & Details Form */}
      <Card title="1. Product Information & Category">
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />

            <Select
              label="Category"
              options={[
                { value: '', label: '-- Select Category --' },
                ...categories.flatMap((c) => [
                  { value: String(c.id), label: c.name },
                  ...(c.children || []).map((child) => ({
                    value: String(child.id),
                    label: `${c.name} > ${child.name}`,
                  })),
                ]),
              ]}
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            />

            <Select
              label="Status"
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand Name"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />

            <Select
              label="Gender Target"
              options={[
                { value: 'WOMEN', label: 'Women' },
                { value: 'UNISEX', label: 'Unisex' },
              ]}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            />
          </div>

          <Textarea
            label="Full Description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end pt-2 border-t">
            <Button type="submit" isLoading={isSavingProduct} size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Basic Details
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Product Photos & Media Manager */}
      <Card title="2. Product Photos & Media Gallery">
        <div className="space-y-4 text-xs">
          <p className="text-neutral-500">Upload multiple high-resolution photos. The first image will be set as the primary product cover.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {productImages.map((imgObj, idx) => {
              const url = typeof imgObj === 'string' ? imgObj : imgObj.image_url;
              const colorName = typeof imgObj === 'string' ? null : imgObj.color_name;
              const availableColors = Array.from(new Set(product?.variants?.map((v) => v.color).filter(Boolean)));

              return (
                <div key={idx} className="relative aspect-3/4 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 group">
                  <Image src={url} alt={`Product ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity z-10"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 z-10">
                    <select
                      value={colorName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductImages((prev) =>
                          prev.map((item, i) => (i === idx ? { ...(typeof item === 'string' ? { image_url: item } : item), color_name: val || null } : item))
                        );
                      }}
                      className="bg-neutral-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border-0 focus:outline-none w-full shadow-xs"
                    >
                      <option value="">-- All Colors --</option>
                      {availableColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>

                    {idx === 0 && (
                      <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider w-fit">
                        Cover Photo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <label className="aspect-3/4 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-black transition-colors bg-neutral-50">
              <ImagePlus className="w-6 h-6 text-neutral-400 mb-1" />
              <span className="text-[11px] font-bold text-neutral-700">{isUploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">PNG, JPG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button type="button" onClick={handleSaveProduct} isLoading={isSavingProduct} size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Photos
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Variants Matrix Card */}
      <Card
        title="3. Clothing Variants Matrix"
        subtitle="Size, Color, Price, MRP & Stock Balances"
      >
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setGeneratorModalOpen(true)}
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
          >
            Auto-Generate Matrix
          </Button>
        </div>

        {variants.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">No Variants Created Yet</p>
            <Button size="sm" onClick={() => setGeneratorModalOpen(true)} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Auto-Generate Matrix
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">MRP</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {variants.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{v.color}</td>
                    <td className="py-3.5 px-4 font-bold text-neutral-800">{v.size}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600 text-[11px]">{v.sku}</td>
                    <td className="py-3.5 px-4 font-black text-neutral-900">₹{v.price.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-neutral-400 line-through">₹{v.mrp.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={v.stock > 5 ? 'success' : v.stock > 0 ? 'warning' : 'error'}>
                        {v.stock > 0 ? `${v.stock} in stock` : 'OUT OF STOCK'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditVariant(v)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteVariant(v.id!)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Variant Generator Modal */}
      <Modal
        isOpen={generatorModalOpen}
        onClose={() => setGeneratorModalOpen(false)}
        title="Apparel Variant Matrix Generator"
      >
        <form onSubmit={handleGenerateVariants} className="space-y-4">
          <Input
            label="Colors (Comma-Separated)"
            placeholder="Midnight Black, Ivory White, Royal Red"
            value={selectedColorsText}
            onChange={(e) => setSelectedColorsText(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-neutral-700">Available Clothing Sizes</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                    selectedSizes.includes(sz)
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 bg-white text-neutral-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
            />
            <Input
              label="MRP (₹)"
              type="number"
              value={baseMrp}
              onChange={(e) => setBaseMrp(e.target.value)}
              required
            />
            <Input
              label="Initial Stock"
              type="number"
              value={baseStock}
              onChange={(e) => setBaseStock(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setGeneratorModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isGenerating} size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Generate Combinations
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Single Variant Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Clothing Variant"
      >
        <form onSubmit={handleSaveVariant} className="space-y-4">
          <Input
            label="Variant SKU"
            value={editForm.sku}
            onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Color Name"
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
              required
            />
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Color Code (Hex)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={editForm.color_code}
                  onChange={(e) => setEditForm({ ...editForm, color_code: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={editForm.color_code}
                  onChange={(e) => setEditForm({ ...editForm, color_code: e.target.value })}
                  className="flex-1 px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>
            <Input
              label="Size"
              value={editForm.size}
              onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              required
            />
            <Input
              label="MRP (₹)"
              type="number"
              value={editForm.mrp}
              onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })}
              required
            />
            <Input
              label="Available Stock"
              type="number"
              value={editForm.stock}
              onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSavingVariant} size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Variant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
