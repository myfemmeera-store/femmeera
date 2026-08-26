<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watch_and_shop_videos', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('video_url', 500);
            $table->string('poster_url', 500)->nullable();
            $table->string('product_url', 500);
            $table->string('button_text', 50)->default('View Product');
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watch_and_shop_videos');
    }
};
