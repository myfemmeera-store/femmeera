<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create shipping_rules table
        if (!Schema::hasTable('shipping_rules')) {
            Schema::create('shipping_rules', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100);
                $table->decimal('min_order_amount', 10, 2)->default(0.00);
                $table->decimal('max_order_amount', 10, 2)->nullable();
                $table->decimal('shipping_fee', 10, 2)->default(0.00);
                $table->string('estimated_days', 100)->default('3-5 working days');
                $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
                $table->timestamps();
            });
        }

        // 2. Add product shipping & return fields
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'shipping_type')) {
                $table->enum('shipping_type', ['READY_TO_SHIP', 'MADE_TO_ORDER', 'EXPRESS'])->default('READY_TO_SHIP')->after('brand');
            }
            if (!Schema::hasColumn('products', 'delivery_estimate')) {
                $table->string('delivery_estimate', 100)->default('3-7 working days')->after('shipping_type');
            }
            if (!Schema::hasColumn('products', 'return_policy_type')) {
                $table->enum('return_policy_type', ['RETURNABLE', 'NON_RETURNABLE', 'EXCHANGE_ONLY'])->default('RETURNABLE')->after('delivery_estimate');
            }
        });

        // 3. Create order_returns table
        if (!Schema::hasTable('order_returns')) {
            Schema::create('order_returns', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('order_item_id')->nullable()->constrained('order_items')->onDelete('cascade');
                $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('cascade');
                $table->string('reason', 255);
                $table->text('comment')->nullable();
                $table->json('images')->nullable();
                $table->enum('status', [
                    'REQUESTED',
                    'UNDER_REVIEW',
                    'APPROVED',
                    'REJECTED',
                    'PICKUP_SCHEDULED',
                    'PICKED_UP',
                    'RECEIVED',
                    'REFUND_INITIATED',
                    'REFUNDED'
                ])->default('REQUESTED');
                $table->text('admin_comment')->nullable();
                $table->decimal('refund_amount', 12, 2)->nullable();
                $table->timestamps();

                $table->index(['order_id', 'user_id', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_returns');

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'return_policy_type')) {
                $table->dropColumn('return_policy_type');
            }
            if (Schema::hasColumn('products', 'delivery_estimate')) {
                $table->dropColumn('delivery_estimate');
            }
            if (Schema::hasColumn('products', 'shipping_type')) {
                $table->dropColumn('shipping_type');
            }
        });

        Schema::dropIfExists('shipping_rules');
    }
};
