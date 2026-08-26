<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class InventoryService
{
    /**
     * Get paginated inventory stock levels with search and filters.
     */
    public function getInventory(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        $query = Inventory::with(['variant.product']);

        if ($search) {
            $query->whereHas('variant', function ($q) use ($search) {
                $q->where('sku', 'LIKE', "%{$search}%")
                  ->orWhere('color', 'LIKE', "%{$search}%")
                  ->orWhere('size', 'LIKE', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('updated_at', 'desc')->paginate($perPage);
    }

    /**
     * Get low stock inventory items (available <= low_stock_threshold).
     */
    public function getLowStock(int $perPage = 15): LengthAwarePaginator
    {
        return Inventory::with(['variant.product'])
            ->whereColumn('available_quantity', '<=', 'low_stock_threshold')
            ->where('available_quantity', '>', 0)
            ->paginate($perPage);
    }

    /**
     * Get out of stock inventory items (available = 0).
     */
    public function getOutOfStock(int $perPage = 15): LengthAwarePaginator
    {
        return Inventory::with(['variant.product'])
            ->where('available_quantity', '<=', 0)
            ->paginate($perPage);
    }

    /**
     * Get transaction history for a variant or global.
     */
    public function getHistory(?int $variantId = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryTransaction::with(['variant.product', 'creator']);

        if ($variantId) {
            $query->where('variant_id', $variantId);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Adjust stock quantity manually by Admin (PURCHASE, ADJUSTMENT, DAMAGE, RETURN).
     */
    public function adjustStock(
        int $variantId,
        int $quantityChange,
        string $type,
        ?string $notes = null,
        ?int $adminId = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $quantityChange, $type, $notes, $adminId) {
            // Row-level lock to prevent concurrency race conditions
            $inventory = Inventory::where('variant_id', $variantId)->lockForUpdate()->first();

            if (!$inventory) {
                $inventory = Inventory::create([
                    'variant_id' => $variantId,
                    'available_quantity' => 0,
                    'reserved_quantity' => 0,
                    'low_stock_threshold' => 5,
                ]);
                $inventory = Inventory::where('variant_id', $variantId)->lockForUpdate()->first();
            }

            $newAvailable = $inventory->available_quantity + $quantityChange;

            if ($newAvailable < 0) {
                throw new HttpException(400, "Insufficient stock. Cannot adjust available quantity below 0.");
            }

            $oldAvailable = $inventory->available_quantity;
            $inventory->available_quantity = $newAvailable;
            $inventory->save();

            // Record Inventory Transaction log
            InventoryTransaction::create([
                'variant_id' => $variantId,
                'type' => $type,
                'quantity' => $quantityChange,
                'reference_type' => 'MANUAL_ADJUSTMENT',
                'reference_id' => null,
                'notes' => $notes ?: "Manual adjustment of {$quantityChange} items.",
                'created_by' => $adminId,
                'created_at' => now(),
            ]);

            // Audit log entry
            AuditLogService::log(
                'INVENTORY_UPDATED',
                $adminId,
                'Inventory',
                (string)$inventory->id,
                ['available_quantity' => $oldAvailable],
                ['available_quantity' => $newAvailable, 'type' => $type, 'notes' => $notes]
            );

            return $inventory->load('variant.product');
        });
    }

    /**
     * Reserve stock for a customer order (atomic).
     */
    public function reserveStock(int $variantId, int $quantity, string $orderNumber): void
    {
        $inventory = Inventory::where('variant_id', $variantId)->lockForUpdate()->firstOrFail();

        if ($inventory->available_quantity < $quantity) {
            throw new HttpException(400, "Variant {$inventory->variant->sku} has insufficient available stock.");
        }

        $inventory->available_quantity -= $quantity;
        $inventory->reserved_quantity += $quantity;
        $inventory->save();

        InventoryTransaction::create([
            'variant_id' => $variantId,
            'type' => 'RESERVATION',
            'quantity' => -$quantity,
            'reference_type' => 'ORDER',
            'reference_id' => $orderNumber,
            'notes' => "Stock reserved for order {$orderNumber}",
            'created_at' => now(),
        ]);
    }

    /**
     * Release reserved stock on order cancellation (atomic).
     */
    public function releaseStock(int $variantId, int $quantity, string $orderNumber): void
    {
        $inventory = Inventory::where('variant_id', $variantId)->lockForUpdate()->firstOrFail();

        $releaseQty = min($inventory->reserved_quantity, $quantity);

        $inventory->reserved_quantity -= $releaseQty;
        $inventory->available_quantity += $releaseQty;
        $inventory->save();

        InventoryTransaction::create([
            'variant_id' => $variantId,
            'type' => 'RELEASE',
            'quantity' => $releaseQty,
            'reference_type' => 'ORDER_CANCELLATION',
            'reference_id' => $orderNumber,
            'notes' => "Reserved stock released for cancelled order {$orderNumber}",
            'created_at' => now(),
        ]);
    }
}
