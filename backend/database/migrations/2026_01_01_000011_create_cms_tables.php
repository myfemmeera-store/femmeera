<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['HERO', 'PRODUCT_GRID', 'BANNER', 'CATEGORY_GRID', 'TESTIMONIAL', 'TEXT', 'NEWSLETTER']);
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->longText('content')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('button_text', 50)->nullable();
            $table->string('button_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('hero_banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image_url', 500);
            $table->string('mobile_image_url', 500);
            $table->string('button_text', 50)->nullable();
            $table->string('button_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('popups', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('button_text', 50)->nullable();
            $table->string('button_url')->nullable();
            $table->string('coupon_code', 50)->nullable();
            $table->integer('delay_seconds')->default(3);
            $table->integer('frequency')->default(1);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            $table->string('link_url')->nullable();
            $table->string('background_color', 20)->default('#000000');
            $table->string('text_color', 20)->default('#FFFFFF');
            $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('popups');
        Schema::dropIfExists('hero_banners');
        Schema::dropIfExists('homepage_sections');
    }
};
