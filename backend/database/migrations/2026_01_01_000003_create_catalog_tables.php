<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('banner_url', 500)->nullable();
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['ACTIVE', 'DISABLED', 'ARCHIVED'])->default('ACTIVE');
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();

            $table->index('parent_id');
            $table->index('slug');
            $table->index('status');
        });

        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('code', 100)->unique();
            $table->enum('type', ['SELECT', 'MULTISELECT', 'TEXT'])->default('SELECT');
            $table->boolean('is_filterable')->default(true);
            $table->timestamps();

            $table->index('code');
            $table->index('is_filterable');
        });

        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained('attributes')->onDelete('cascade');
            $table->string('value');
            $table->string('slug');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['attribute_id', 'slug']);
        });

        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('banner_url', 500)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'is_featured'], 'idx_coll_status_feat');
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->foreignId('collection_id')->nullable()->constrained('collections')->onDelete('set null');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku', 100)->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('brand', 100)->default('Femmeera');
            $table->enum('gender', ['WOMEN', 'MEN', 'UNISEX'])->default('WOMEN');
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'ARCHIVED'])->default('ACTIVE');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new')->default(false);
            $table->boolean('is_best_seller')->default(false);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('category_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('sku', 100)->unique();
            $table->string('size', 20);
            $table->string('color', 50);
            $table->decimal('price', 12, 2);
            $table->decimal('mrp', 12, 2);
            $table->integer('stock')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();

            $table->index('product_id');
            $table->index('sku');
            $table->index('status');
            $table->unique(['product_id', 'size', 'color']);
        });

        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('attribute_value_id')->constrained('attribute_values')->onDelete('cascade');
            $table->primary(['product_id', 'attribute_value_id']);
            $table->index('attribute_value_id');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');
            $table->string('image_url', 500);
            $table->string('alt_text')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['product_id', 'sort_order'], 'idx_img_prod_sort');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_attribute_values');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('collections');
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');
        Schema::dropIfExists('categories');
    }
};
