<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->enum('type', ['PERCENTAGE', 'FIXED']);
            $table->decimal('value', 12, 2);
            $table->decimal('minimum_order_amount', 12, 2)->default(0.00);
            $table->decimal('maximum_discount_amount', 12, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_limit_per_user')->default(1);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->enum('status', ['ACTIVE', 'EXPIRED', 'DISABLED'])->default('ACTIVE');
            $table->timestamps();

            $table->index('code');
            $table->index('status');
        });

        Schema::create('coupon_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained('coupons')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('discount_amount', 12, 2);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['PRODUCT', 'CATEGORY', 'COLLECTION', 'BUY_X_GET_Y', 'FREE_SHIPPING']);
            $table->decimal('value', 12, 2)->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->enum('status', ['ACTIVE', 'EXPIRED', 'DISABLED'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('offer_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('offers')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->integer('minimum_quantity')->default(1);
            $table->decimal('minimum_order_amount', 12, 2)->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offer_rules');
        Schema::dropIfExists('offers');
        Schema::dropIfExists('coupon_usage');
        Schema::dropIfExists('coupons');
    }
};
