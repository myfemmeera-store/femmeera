'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Search,
  Edit2,
  Archive,
  Package,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

export default function ProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Archive modal state
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Reorder mode state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderCategory, setReorderCategory] = useState<string>(''); // '' = all/new arrivals, 'traditional-wear', 'western-wear'
  const [reorderList, setReorderList] = useState<Product[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isLoadingReorder, setIsLoadingReorder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts(currentPage, debouncedSearch);
      if (res.success && res.data) {
        setProducts(res.data);
        if (res.meta?.pagination) {
          setLastPage(res.meta.pagination.last_page);
        }
      } else {
        setError(res.message || 'Failed to fetch catalog products.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error connecting to product API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, debouncedSearch]);

  const handleArchiveConfirm = async () => {
    if (!selectedProduct) return;
    setIsArchiving(true);
    try {
      const res = await productService.deleteProduct(selectedProduct.id);
      if (res.success) {
        showToast(`Product "${selectedProduct.name}" archived successfully.`, 'success');
        setArchiveModalOpen(false);
        loadProducts();
      } else {
        showToast(res.message || 'Unable to archive product.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error archiving product.', 'error');
    } finally {
      setIsArchiving(false);
    }
  };

  // Reorder functions
  const openReorderMode = async (catSlug: string = '') => {
    setReorderCategory(catSlug);
    setIsReorderMode(true);
    setIsLoadingReorder(true);
    try {
      const res = await productService.getProducts(1, '', catSlug, 100);
      if (res.success && res.data) {
        setReorderList(res.data);
      }
    } catch (err) {
      showToast('Failed to load products for reordering.', 'error');
    } finally {
      setIsLoadingReorder(false);
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= reorderList.length) return;
    const updated = [...reorderList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setReorderList(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    moveItem(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const saveProductOrder = async () => {
    if (reorderList.length === 0) return;
    setIsSavingOrder(true);
    try {
      const payload = reorderList.map((item, idx) => ({
        id: item.id,
        sort_order: idx + 1,
      }));
      const res = await productService.reorderProducts(payload);
      if (res.success) {
        showToast('Product order updated successfully!', 'success');
        setIsReorderMode(false);
        loadProducts();
      } else {
        showToast(res.message || 'Failed to save product order.', 'error');
      }
    } catch (err: any) {
      const errMsg = err?.message || (err instanceof Error ? err.message : 'Error saving product order.');
      showToast(errMsg, 'error');
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-neutral-500">Manage women's traditional & western clothing catalog & section order</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => openReorderMode('')}
            leftIcon={<Layers className="w-4 h-4 text-[#B38548]" />}
          >
            Reorder Products
          </Button>
          <Link href="/dashboard/products/new">
            <Button leftIcon={<Plus className="w-4 h-4 shrink-0" />}>
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* REORDER PRODUCTS SECTION MODAL / VIEW */}
      {isReorderMode && (
        <Card className="!p-5 border-2 border-[#B38548]/30 shadow-lg bg-neutral-50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#B38548]" />
                <h2 className="text-base font-bold text-neutral-900">
                  Drag & Drop Product Ordering
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Drag products up or down to set their display sequence on the homepage (New Arrivals, Traditional & Western Wear).
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={saveProductOrder}
                isLoading={isSavingOrder}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-[#B38548] hover:bg-[#966C32] text-white"
              >
                Save Order
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReorderMode(false)}
                className="text-neutral-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Section Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
            <button
              onClick={() => openReorderMode('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                reorderCategory === ''
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              All / New Arrivals
            </button>
            <button
              onClick={() => openReorderMode('traditional-wear')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                reorderCategory === 'traditional-wear'
                  ? 'bg-[#B38548] text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Traditional Wear
            </button>
            <button
              onClick={() => openReorderMode('western-wear')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                reorderCategory === 'western-wear'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Western Wear
            </button>
          </div>

          {/* Draggable Items List */}
          {isLoadingReorder ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : reorderList.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No products found in this section to reorder.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {reorderList.map((item, idx) => {
                const imgUrl = item.images && item.images.length > 0 ? item.images[0].image_url : null;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`flex items-center justify-between p-3 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-[#B38548] transition-all cursor-move ${
                      draggedIndex === idx ? 'opacity-50 border-dashed border-[#B38548]' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="text-neutral-400 hover:text-neutral-700 cursor-grab active:cursor-grabbing p-1">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden relative">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-neutral-400 m-2" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-neutral-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">{item.sku} {item.category ? `• ${item.category.name}` : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, idx - 1)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 rounded-lg"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === reorderList.length - 1}
                        onClick={() => moveItem(idx, idx + 1)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 rounded-lg"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Search & Filtering Bar */}
      <Card className="!p-3 sm:!p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black min-h-[40px]"
            />
          </div>
          <Button variant="outline" size="sm" leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
            Filter Options
          </Button>
        </div>
      </Card>

      {/* Main Product Table / Cards View */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="Your clothing catalog currently has no products matching your query."
          actionText="Add Product"
          onAction={() => window.location.href = '/dashboard/products/new'}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Data Table (hidden on mobile) */}
          <div className="hidden md:block overflow-hidden bg-white border border-neutral-200/80 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Product Info</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {products.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-500 text-[11px]">
                      #{p.sort_order || (currentPage - 1) * 15 + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {p.images && p.images.length > 0 ? (
                            <Image
                              src={p.images[0].image_url}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{p.name}</p>
                          <p className="text-[11px] text-neutral-400">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">{p.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-neutral-700">{p.brand}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/dashboard/products/${p.id}/edit`}>
                          <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(p);
                            setArchiveModalOpen(true);
                          }}
                          className="text-neutral-500 hover:text-rose-600"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Product Cards Stack (visible on mobile < 768px) */}
          <div className="md:hidden space-y-3">
            {products.map((p, idx) => (
              <Card key={p.id} className="!p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-14 h-14 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-neutral-900 truncate">{p.name}</h3>
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-500">SKU: {p.sku}</p>
                    <p className="text-[11px] text-neutral-500">Brand: {p.brand}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between space-x-2">
                  <Link href={`/dashboard/products/${p.id}/edit`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                      Edit Product
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(p);
                      setArchiveModalOpen(true);
                    }}
                    className="text-neutral-400 hover:text-rose-600"
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <span className="text-xs font-medium text-neutral-500">
                Page {currentPage} of {lastPage}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= lastPage}
                  onClick={() => setCurrentPage((prev) => Math.min(lastPage, prev + 1))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Archiving Product */}
      <ConfirmDialog
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchiveConfirm}
        title="Archive Product?"
        message={`"${selectedProduct?.name}" will no longer appear in the customer storefront catalog.`}
        confirmText="Archive Product"
        isDanger
        isLoading={isArchiving}
      />
    </div>
  );
}
