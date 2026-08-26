<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop early phase placeholder tables if existing to enforce exact Phase 7 architecture
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('coupon_usage');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('offer_category');
        Schema::dropIfExists('offer_product');
        Schema::dropIfExists('offer_rules');
        Schema::dropIfExists('offers');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('shipping_zones');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('tax_rules');

        // 1. Carts Table (Spec Section 2)
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_session_id', 100)->nullable()->index();
            $table->enum('status', ['ACTIVE', 'CONVERTED', 'ABANDONED'])->default('ACTIVE');
            $table->timestamp('last_activity_at')->useCurrent();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['guest_session_id', 'status']);
        });

        // 2. Cart Items Table (Spec Section 2 & 3)
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained('carts')->cascadeOnDelete();
            $table->foreignId('variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->unique(['cart_id', 'variant_id']);
        });

        // 3. Customer Addresses Table (Spec Section 15 & 16)
        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['SHIPPING', 'BILLING'])->default('SHIPPING');
            $table->string('name', 255);
            $table->string('phone', 20);
            $table->string('address_line_1', 255);
            $table->string('address_line_2', 255)->nullable();
            $table->string('landmark', 255)->nullable();
            $table->string('city', 100);
            $table->string('state', 100);
            $table->string('postal_code', 20);
            $table->string('country', 100)->default('India');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 4. Shipping Methods Table (Spec Section 18)
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('description', 255)->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->integer('estimated_min_days')->default(3);
            $table->integer('estimated_max_days')->default(5);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        // 5. Coupons Table (Spec Section 22)
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->enum('discount_type', ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'])->default('PERCENTAGE');
            $table->decimal('discount_value', 10, 2);
            $table->decimal('minimum_order_amount', 10, 2)->default(0.00);
            $table->decimal('maximum_discount_amount', 10, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_limit_per_customer')->nullable();
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        // 6. Coupon Usages Table
        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained('coupons')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        // 7. Offers Table (Spec Section 27)
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->enum('type', ['PRODUCT_DISCOUNT', 'CATEGORY_DISCOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'ORDER_DISCOUNT'])->default('ORDER_DISCOUNT');
            $table->enum('discount_type', ['PERCENTAGE', 'FIXED_AMOUNT'])->default('PERCENTAGE');
            $table->decimal('discount_value', 10, 2);
            $table->integer('minimum_quantity')->default(1);
            $table->decimal('minimum_order_amount', 10, 2)->default(0.00);
            $table->decimal('maximum_discount', 10, 2)->nullable();
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('offer_product', function (Blueprint $table) {
            $table->foreignId('offer_id')->constrained('offers')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->primary(['offer_id', 'product_id']);
        });

        Schema::create('offer_category', function (Blueprint $table) {
            $table->foreignId('offer_id')->constrained('offers')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->primary(['offer_id', 'category_id']);
        });

        // 8. Tax Rules Table (Spec Section 21)
        Schema::create('tax_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->decimal('rate_percentage', 5, 2)->default(0.00);
            $table->boolean('is_inclusive')->default(false);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_rules');
        Schema::dropIfExists('offer_category');
        Schema::dropIfExists('offer_product');
        Schema::dropIfExists('offers');
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};
