'use client';

import React, { useEffect, useState } from 'react';
import { inventoryService, InventoryTransactionItem } from '@/services/inventoryService';
import { InventoryItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { Search, Warehouse, AlertTriangle, PackageX, History, Edit3, Plus } from 'lucide-react';

export default function InventoryPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'out' | 'history'>('all');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [historyItems, setHistoryItems] = useState<InventoryTransactionItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState('10');
  const [adjustType, setAdjustType] = useState('PURCHASE');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'all') {
        const res = await inventoryService.getInventory(currentPage, debouncedSearch);
        if (res.success && res.data) {
          setItems(res.data);
          if (res.meta?.pagination) setLastPage(res.meta.pagination.last_page);
        }
      } else if (activeTab === 'low') {
        const res = await inventoryService.getLowStock(currentPage);
        if (res.success && res.data) {
          setItems(res.data);
          if (res.meta?.pagination) setLastPage(res.meta.pagination.last_page);
        }
      } else if (activeTab === 'out') {
        const res = await inventoryService.getOutOfStock(currentPage);
        if (res.success && res.data) {
          setItems(res.data);
          if (res.meta?.pagination) setLastPage(res.meta.pagination.last_page);
        }
      } else if (activeTab === 'history') {
        const res = await inventoryService.getHistory(currentPage);
        if (res.success && res.data) {
          setHistoryItems(res.data);
          if (res.meta?.pagination) setLastPage(res.meta.pagination.last_page);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading inventory data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, debouncedSearch]);

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedVariant(item);
    setAdjustQty('10');
    setAdjustType('PURCHASE');
    setAdjustNotes('New inventory stock received.');
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    setIsSaving(true);
    try {
      const qty = parseInt(adjustQty, 10);
      const res = await inventoryService.adjustStock(
        selectedVariant.variant_id,
        qty,
        adjustType,
        adjustNotes
      );

      if (res.success) {
        showToast(`Inventory updated for variant #${selectedVariant.variant_id}.`, 'success');
        setAdjustModalOpen(false);
        loadData();
      } else {
        showToast(res.message || 'Unable to update inventory.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error adjusting inventory.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Stock & Inventory Balance</h1>
          <p className="text-xs text-neutral-500">Atomic inventory management at clothing variant size level</p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>All Variant Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('low')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'low'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Low Stock Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('out')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'out'
              ? 'border-rose-600 text-rose-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <PackageX className="w-4 h-4 text-rose-500" />
          <span>Out of Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Audit Log</span>
        </button>
      </div>

      {/* Search Bar for Inventory */}
      {activeTab !== 'history' && (
        <Card className="!p-3 sm:!p-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by SKU, product name, color, size..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black min-h-[40px]"
            />
          </div>
        </Card>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : activeTab === 'history' ? (
        /* Inventory History Audit Table */
        <div className="overflow-hidden bg-white border border-neutral-200/80 rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Variant SKU</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {historyItems.map((h) => (
                <tr key={h.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                    {new Date(h.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        h.type === 'PURCHASE' || h.type === 'RELEASE' || h.type === 'RETURN'
                          ? 'success'
                          : h.type === 'DAMAGE' || h.type === 'SALE' || h.type === 'RESERVATION'
                          ? 'error'
                          : 'neutral'
                      }
                    >
                      {h.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">{h.variant?.sku || `#${h.variant_id}`}</td>
                  <td className={`py-3 px-4 font-bold ${h.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {h.quantity > 0 ? `+${h.quantity}` : h.quantity}
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{h.reference_id || h.reference_type || '-'}</td>
                  <td className="py-3 px-4 text-neutral-500">{h.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No Inventory Items Found"
          description="There are currently no stock balances matching the selected criteria."
        />
      ) : (
        /* Inventory Items Matrix */
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden bg-white border border-neutral-200/80 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Product Variant</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Reserved</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900">{item.product_name || item.variant?.product?.name || 'Product Variant'}</p>
                      <p className="text-[11px] text-neutral-500">
                        Size: <span className="font-bold text-neutral-800">{item.size || item.variant?.size}</span> | Color:{' '}
                        <span className="font-bold text-neutral-800">{item.color || item.variant?.color}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">{item.sku || item.variant?.sku}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black text-sm ${
                          item.available_quantity <= 0
                            ? 'text-rose-600'
                            : item.available_quantity <= item.low_stock_threshold
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.available_quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-600">{item.reserved_quantity}</td>
                    <td className="py-3.5 px-4 text-neutral-500">{item.low_stock_threshold}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAdjust(item)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      >
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Inventory Cards */}
          <div className="md:hidden space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="!p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">{item.product_name || item.variant?.product?.name}</h3>
                    <p className="text-[11px] font-mono text-neutral-500 mt-0.5">SKU: {item.sku || item.variant?.sku}</p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Size: <span className="font-bold">{item.size || item.variant?.size}</span> | Color:{' '}
                      <span className="font-bold">{item.color || item.variant?.color}</span>
                    </p>
                  </div>
                  <Badge variant={item.available_quantity <= 0 ? 'error' : item.available_quantity <= item.low_stock_threshold ? 'warning' : 'success'}>
                    {item.available_quantity <= 0 ? 'OUT OF STOCK' : item.available_quantity <= item.low_stock_threshold ? 'LOW STOCK' : 'IN STOCK'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 p-2 bg-neutral-50 rounded-lg text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Available</span>
                    <span className="font-black text-sm text-neutral-900">{item.available_quantity}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Reserved</span>
                    <span className="font-black text-sm text-neutral-600">{item.reserved_quantity}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase">Threshold</span>
                    <span className="font-bold text-neutral-500">{item.low_stock_threshold}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleOpenAdjust(item)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Adjust Inventory
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust Variant Inventory"
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-lg text-xs space-y-1">
            <p className="font-bold text-neutral-900">{selectedVariant?.product_name || selectedVariant?.variant?.product?.name}</p>
            <p className="text-neutral-500">SKU: {selectedVariant?.sku || selectedVariant?.variant?.sku}</p>
            <p className="text-neutral-700">Current Available: <span className="font-black text-black">{selectedVariant?.available_quantity}</span></p>
          </div>

          <Select
            label="Adjustment Transaction Type"
            options={[
              { value: 'PURCHASE', label: 'PURCHASE (+ Stock Received)' },
              { value: 'ADJUSTMENT', label: 'ADJUSTMENT (+/- Manual Change)' },
              { value: 'RETURN', label: 'RETURN (+ Stock Returned)' },
              { value: 'DAMAGE', label: 'DAMAGE (- Damaged Items)' },
            ]}
            value={adjustType}
            onChange={(e) => setAdjustType(e.target.value)}
          />

          <Input
            label="Quantity Adjustment (+ or -)"
            type="number"
            placeholder="e.g. 10 or -5"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
            required
          />

          <Input
            label="Reason / Notes (Required for Audit Log)"
            placeholder="e.g. New stock shipment arrival from supplier"
            value={adjustNotes}
            onChange={(e) => setAdjustNotes(e.target.value)}
            required
          />

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setAdjustModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} size="sm">
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
