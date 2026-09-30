<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('products')
            ->where('name', 'LIKE', 'Product Title %')
            ->orWhere('slug', 'LIKE', 'product-title-%')
            ->get()
            ->each(function ($product) {
                $cleanName = str_replace('Product Title ', '', $product->name);
                $cleanSlug = str_replace('product-title-', '', $product->slug);
                $cleanSku = str_replace('FMR-PRODUCT-TI-', 'FMR-DRY-COT-LEO-', $product->sku);

                DB::table('products')
                    ->where('id', $product->id)
                    ->update([
                        'name' => $cleanName,
                        'slug' => $cleanSlug,
                        'sku' => $cleanSku,
                        'updated_at' => now(),
                    ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal required
    }
};
