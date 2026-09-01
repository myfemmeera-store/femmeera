<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('product_variants')) {
            Schema::table('product_variants', function (Blueprint $table) {
                if (!Schema::hasColumn('product_variants', 'color_code')) {
                    $table->string('color_code', 30)->nullable()->after('color');
                }
            });
        }

        if (Schema::hasTable('product_images')) {
            Schema::table('product_images', function (Blueprint $table) {
                if (!Schema::hasColumn('product_images', 'color_name')) {
                    $table->string('color_name', 100)->nullable()->after('product_variant_id');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('product_variants')) {
            Schema::table('product_variants', function (Blueprint $table) {
                if (Schema::hasColumn('product_variants', 'color_code')) {
                    $table->dropColumn('color_code');
                }
            });
        }

        if (Schema::hasTable('product_images')) {
            Schema::table('product_images', function (Blueprint $table) {
                if (Schema::hasColumn('product_images', 'color_name')) {
                    $table->dropColumn('color_name');
                }
            });
        }
    }
};
