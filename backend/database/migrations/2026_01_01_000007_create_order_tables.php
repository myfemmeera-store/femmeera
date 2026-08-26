<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->string('order_number', 50)->unique();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('shipping_amount', 12, 2)->default(0.00);
            $table->decimal('tax_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2);
            $table->string('currency', 10)->default('INR');
            $table->enum('payment_status', [
                'PENDING',
                'AUTHORIZED',
                'PAID',
                'FAILED',
                'REFUNDED',
                'PARTIALLY_REFUNDED'
            ])->default('PENDING');
            $table->enum('order_status', [
                'PENDING',
                'CONFIRMED',
                'PROCESSING',
                'PACKED',
                'SHIPPED',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'CANCELLED',
                'RETURN_REQUESTED',
                'RETURNED',
                'REFUNDED'
            ])->default('PENDING');
            $table->json('shipping_address_snapshot');
            $table->json('billing_address_snapshot');
            $table->string('carrier', 100)->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->string('tracking_url', 255)->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('order_number');
            $table->index('order_status');
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->foreignId('variant_id')->constrained('product_variants')->onDelete('restrict');
            $table->string('product_name_snapshot');
            $table->string('sku_snapshot', 100);
            $table->string('size_snapshot', 20);
            $table->string('color_snapshot', 50);
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->index('order_id');
        });

        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('previous_status', 50)->nullable();
            $table->string('new_status', 50);
            $table->text('comment')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
