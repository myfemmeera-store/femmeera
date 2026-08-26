'use client';

import React, { useEffect, useState } from 'react';
import { categoryService } from '@/services/categoryService';
import { mediaService } from '@/services/mediaService';
import { Category } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { Plus, FolderTree, ChevronRight, ChevronDown, Edit2, Trash2, FolderPlus, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function CategoriesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentForNew, setParentForNew] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setError(res.message || 'Failed to load categories.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = (parentIdNum: number | null = null) => {
    setEditingCategory(null);
    setParentForNew(parentIdNum);
    setName('');
    setSlug('');
    setParentId(parentIdNum ? String(parentIdNum) : '');
    setDescription('');
    setImageUrl('');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parent_id ? String(cat.parent_id) : '');
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setStatus(cat.status === 'DISABLED' ? 'DISABLED' : 'ACTIVE');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await mediaService.uploadImage(file, 'categories');
      if (res.success && res.data) {
        setImageUrl(res.data.url);
        showToast('Category image uploaded successfully.', 'success');
      }
    } catch (err) {
      showToast('Image upload failed.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('Category name is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Category> = {
        name,
        slug,
        parent_id: parentId ? Number(parentId) : null,
        description,
        image_url: imageUrl,
        status,
      };

      let res;
      if (editingCategory) {
        res = await categoryService.updateCategory(editingCategory.id, payload);
      } else {
        res = await categoryService.createCategory(payload);
      }

      if (res.success) {
        showToast(
          editingCategory
            ? `Category "${name}" updated successfully.`
            : `New Category "${name}" created successfully.`,
          'success'
        );
        setModalOpen(false);
        loadCategories();
      } else {
        showToast(res.message || 'Unable to save category.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving category.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await categoryService.deleteCategory(categoryToDelete.id);
      if (res.success) {
        showToast(`Category "${categoryToDelete.name}" disabled/archived.`, 'success');
        setDeleteModalOpen(false);
        loadCategories();
      } else {
        showToast(res.message || 'Unable to delete category.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting category.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const rootCategories = categories.filter((c) => !c.parent_id);
  const getChildren = (parentIdNum: number) => categories.filter((c) => c.parent_id === parentIdNum);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Category Hierarchy</h1>
          <p className="text-xs text-neutral-500">Manage traditional and western clothing categories & category images</p>
        </div>
        <Button onClick={() => handleOpenAddModal(null)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Root Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadCategories} />
      ) : (
        <div className="space-y-4">
          {rootCategories.map((root) => {
            const children = getChildren(root.id);
            const isExpanded = expanded[root.id] ?? true;

            return (
              <Card key={root.id} className="!p-4 sm:!p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {children.length > 0 ? (
                      <button
                        onClick={() => toggleExpand(root.id)}
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    ) : (
                      <FolderTree className="w-5 h-5 text-neutral-400 ml-1" />
                    )}

                    {root.image_url ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                        <Image src={root.image_url} alt={root.name} fill className="object-cover" />
                      </div>
                    ) : null}

                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-sm sm:text-base font-extrabold text-neutral-900">{root.name}</h2>
                        <Badge variant={root.status === 'ACTIVE' ? 'success' : 'neutral'}>{root.status}</Badge>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400">/{root.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddModal(root.id)}
                      leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
                      className="hidden sm:inline-flex"
                    >
                      Add Subcategory
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(root)}
                      className="!p-2 text-neutral-600 hover:text-black"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryToDelete(root);
                        setDeleteModalOpen(true);
                      }}
                      className="!p-2 text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && children.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 pl-6 sm:pl-8 space-y-2">
                    {children.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/80 hover:bg-neutral-100/60 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          {sub.image_url ? (
                            <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0">
                              <Image src={sub.image_url} alt={sub.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          )}
                          <div>
                            <span className="text-xs font-bold text-neutral-800">{sub.name}</span>
                            <span className="text-[10px] font-mono text-neutral-400 ml-2">/{sub.slug}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(sub)}
                            className="!p-1.5 text-neutral-500 hover:text-black"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCategoryToDelete(sub);
                              setDeleteModalOpen(true);
                            }}
                            className="!p-1.5 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Category Name"
            placeholder="e.g. Sarees or Western Wear"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="URL Slug"
            placeholder="traditional-wear"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <Select
            label="Parent Category"
            options={[
              { value: '', label: '-- None (Root Category) --' },
              ...categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          />

          {/* Category Image Upload */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-700 block">Category Image</label>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <div className="relative w-12 h-12 rounded border overflow-hidden shrink-0">
                  <Image src={imageUrl} alt="Category Preview" fill className="object-cover" />
                </div>
              )}
              <label className="cursor-pointer px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border rounded-lg font-bold flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <Select
            label="Status"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'DISABLED', label: 'Disabled' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ACTIVE')}
          />

          <Textarea
            label="Category Description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} size="sm">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Disable Category?"
        message={`Are you sure you want to disable "${categoryToDelete?.name}"? Subcategories and products will be archived.`}
        confirmText="Disable Category"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
